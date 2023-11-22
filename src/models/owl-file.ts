import { BehaviorSubject, Observable, combineLatestWith, distinctUntilChanged, filter, map } from "rxjs";
import { Klass, Property, klassFromDeserialized } from "./klass";
import { Clause, Rule, Variable, ruleFromDeserialized } from "./rule";
import { v4 as uuidv4 } from "uuid";
import { klasses, rules } from "./test-data";
import * as R from "ramda";

function expectVariable(v: Variable): string {
  if (typeof (v) !== "object" || !v?.variable) {
    throw `Expected variable, got ${v}`;
  }
  return v.variable;
}

export interface Condition {
  builtin: string | "exactly" | undefined,
  value: string | undefined
};

export interface Datavalue {
  field: string | undefined,
  instance: string | undefined,
  conditionIds: string[],
}

export interface Objekt {
  name: string | undefined,
  klass: string | undefined,
  datavalueIds: string[],
}

export interface Relation {
  name: string | undefined,
  variables: string[],
}

export interface EnhancedRule extends Omit<Rule, "clauses"> {
  objektIds: string[];
  relationIds: string[];
}

export class Set<T extends string> {
  entities: BehaviorSubject<{ [id: string]: undefined }>;

  constructor() {
    this.entities = new BehaviorSubject({});
  }

  add(value: T) {
    this.entities.next({ ...this.entities.getValue(), [value]: undefined });
  }

  values() {
    return this.entities.pipe(
      map(entities => Object.keys(entities)),
    );
  }
}

export class Table<T> {
  entities: BehaviorSubject<{ [id: string]: T }>;

  constructor() {
    this.entities = new BehaviorSubject({});
  }

  ids(): Observable<string[]> {
    // We need distinctUntilChanged so that changing changing entities doesn't trigger a rerender of the list.
    return this.entities.pipe(
      map(table => Object.keys(table)),
      distinctUntilChanged((a, b) => R.equals(a, b))
    );
  }

  byId(id: string): Observable<T>{
    // We need distinctUntilChanged so that changing other entities doesn't trigger a rerender on every entity.
    return this.entities.pipe(
      map(table => table[id]),
      filter(x => x !== undefined),
      distinctUntilChanged((a, b) => R.equals(a, b))
    );
  }

  get(id: string): T {
    return this.entities.getValue()[id];
  }

  set(id: string, entity: T) {
    const entities = this.entities.getValue();
    entities[id] = entity;
    this.entities.next(entities);
  }

  add(entity: T): string {
    let id = uuidv4();
    this.set(id, entity);
    return id;
  }

  remove(id: string) {
    this.entities.next(R.omit([id], this.entities.getValue()));
  }

  alter(id: string, f: (old: T) => T) {
    const entities = this.entities.getValue();
    entities[id] = f(entities[id]);
    this.entities.next(entities);
  }

  alterField<K extends keyof T>(id: string, field: K, f: (old: T[K]) => T[K]) {
    this.alter(id, (t: T) => ({ ...t, [field]: f(t[field]) }));
  }

  setField<K extends keyof T>(id: string, field: K, value: T[K]) {
    this.alter(id, (t: T) => ({ ...t, [field]: value }));
  }
}

export class OwlFile {
  path: BehaviorSubject<string | undefined>;

  // These are constant, just deserialized to give a better overview of the rule composition.
  klasses: BehaviorSubject<{ [className: string]: Klass }>;

  builtins: Set<string>;

  // A rule is composed of objekts (and their datavalues) and relations between objects.
  rules: Table<EnhancedRule>;

  // Instances of classes.
  objekts: Table<Objekt>;

  // Members of instances.
  datavalues: Table<Datavalue>;
  datavaluesExpanded: Table<boolean>;

  // Conditions of members.
  conditions: Table<Condition>;

  // Inter-object relations.
  relations: Table<Relation>;

  constructor() {
    this.path = new BehaviorSubject(undefined as string | undefined);

    this.klasses = new BehaviorSubject({});
    this.builtins = new Set();
    this.rules = new Table();
    this.objekts = new Table();
    this.datavalues = new Table();
    this.datavaluesExpanded = new Table();
    this.conditions = new Table();
    this.relations = new Table();

    // TODO remove this.
    this.path.next("lol.rofl");
    this.importData(klasses, rules);
  }

  datavalueConditions(datavalueId: string): Observable<Condition[]> {
    const { datavalues, conditions } = this;
    return datavalues.byId(datavalueId).pipe(
      filter(x => x !== undefined),
      map(x => x.conditionIds),
      combineLatestWith(conditions.entities),
      map(([ids, conditions]) => ids.map(id => conditions[id]))
    );
  }

  datavalueOptions(objektId: string): Observable<string[]> {
    return this.objekts.byId(objektId).pipe(
      map(x => x?.klass),
      filter(x => x !== undefined),
      combineLatestWith(this.klasses),
      map(
        ([klassName, klasses]) => R.pipe(
          R.path([klassName as string, "datatypeProperties"]) as (x: typeof klasses) => Property[],
          R.pluck("name"),
        )(klasses) as string[] | undefined
      ),
      filter(x => x !== undefined),
    ) as Observable<string[]>;
  }

  addDatavalueOption(objektId: string, name: string) {
    const objekt = this.objekts.get(objektId);
    const klassName = objekt.klass;
    if (klassName === undefined) {
      throw "RIP klassName undefined";
    }
    const oldKlasses = this.klasses.getValue();
    const oldKlass = oldKlasses[klassName];
    const newKlass = {
      ...oldKlass,
      datatypeProperties: [
        ...oldKlass.datatypeProperties,
        {
          name,
          type: "any"

        }
      ]
    };
    this.klasses.next({ ...oldKlasses, [klassName]: newKlass });
  }

  removeCondition(conditionId: string, parentId: string | undefined = undefined) {
    if (parentId !== undefined) {
      this.datavalues.alterField(parentId, "conditionIds", R.without([conditionId]));
    }

    this.conditions.remove(conditionId);
  }

  removeDatavalue(datavalueId: string, parentId: string | undefined = undefined) {
    if (parentId !== undefined) {
      this.objekts.alterField(parentId, "datavalueIds", R.without([datavalueId]));
    }

    const datavalue = this.datavalues.get(datavalueId);
    datavalue.conditionIds.forEach(id => this.removeCondition(id));
    this.datavalues.remove(datavalueId);
  }

  removeObjekt(objektId: string, parentId: string | undefined = undefined) {
    if (parentId !== undefined) {
      this.rules.alterField(parentId, "objektIds", R.without([objektId]));
    }

    const objekt = this.objekts.get(objektId);
    objekt.datavalueIds.forEach(id => this.removeDatavalue(id));
    this.objekts.remove(objektId);
  }

  removeRelation(relationId: string, parentId: string | undefined = undefined) {
    if (parentId !== undefined) {
      this.rules.alterField(parentId, "relationIds", R.without([relationId]));
    }

    this.relations.remove(relationId);
  }

  removeRule(ruleId: string) {
    const rule = this.rules.get(ruleId);
    rule.objektIds.forEach(id => this.removeObjekt(id));
    rule.relationIds.forEach(id => this.removeRelation(id));
    this.rules.remove(ruleId);
  }

  importConditionsForInstance(instance: string, builtinClauses: Clause[]): string[] {
    return builtinClauses
      .filter(clause => clause.args[0]?.variable === instance)
      .map(clause => {
        if (clause.args.length !== 2) {
          throw `Got wrong number of arguments for builtin: ${JSON.stringify(clause)}`;
        }
        const valueOrVar = clause.args[1];
        const isVariable = typeof valueOrVar === "object" && "variable" in valueOrVar;
        const value = isVariable ? `?${valueOrVar.variable}` : valueOrVar?.toString() ?? undefined;

        this.builtins.add(clause.name);
        return this.conditions.add({ builtin: clause.name, value });
      });
  }

  // The datavalue clause attaches the property `name` to the object `args[0]` using the variable `args[1]`.
  // It can also set a value directly, when `args[1]` is not a variable but a value.
  importDatavalue(datavalueClause: Clause, builtinClauses: Clause[]): string {
    if (datavalueClause.args.length !== 2) {
      throw `Unexpected datavalue clause: ${datavalueClause}`;
    }

    const varOrValue = datavalueClause.args[1];
    if (typeof varOrValue === "object" && "variable" in varOrValue) {
      // We're dealing with a variable and some builting operators applied to it.
      const instance = expectVariable(varOrValue);
      return this.datavalues.add({
        field: datavalueClause.name,
        instance,
        conditionIds: this.importConditionsForInstance(instance, builtinClauses),
      });
    } else if (typeof varOrValue !== "object") {
      // We're dealing with a value.
      this.builtins.add("exactly");
      return this.datavalues.add({
        field: datavalueClause.name,
        instance: undefined,
        conditionIds: [this.conditions.add({ builtin: "exactly", value: varOrValue?.toString() })]
      });
    } else {
      // It's an object (so a variable) but has no "variable" key.
      throw `Unexpected datavalue clause: ${datavalueClause}`;
    }
  }

  importDatavaluesForObjekt(name: string, datavalueClauses: Clause[], builtinClauses: Clause[]): string[] {
    return datavalueClauses
      .filter(clause => clause.args[0]?.variable === name)
      .map(datavalueClause => this.importDatavalue(datavalueClause, builtinClauses));
  }

  importObjekt(objektClause: Clause, datavalueClauses: Clause[], builtinClauses: Clause[]): string {
    const { name: klass, args } = objektClause;
    if (args.length !== 1) {
      throw `Unexpected multivariable class clause: ${objektClause}`;
    }

    const name = expectVariable(args[0]);
    const datavalueIds = this.importDatavaluesForObjekt(name, datavalueClauses, builtinClauses);
    return this.objekts.add({ name, klass, datavalueIds });
  }

  importRelation(clause: Clause): string {
    const { type, name, args } = clause;
    if (type !== "property") {
      throw `Unexpected non-property relation clause: ${clause}`;
    }
    return this.relations.add({ name, variables: args.map(x => x.variable) });
  }

  importRule(rule: Rule) {
    const clauses: { [key: string]: Clause[] } = { class: [], datavalue: [], builtin: [], property: [] };
    rule.clauses.forEach(clause => clauses[clause.type].push(clause));

    let objektIds = clauses.class.map(objektClause => this.importObjekt(objektClause, clauses.datavalue, clauses.builtin));
    let relationIds = clauses.property.map(propertyClause => this.importRelation(propertyClause));

    this.rules.add({ name: rule.name, enabled: rule.enabled, objektIds, relationIds });
  }

  importData(klasses: Klass[], rules: Rule[]) {
    this.klasses.next(Object.fromEntries(klasses.map(klass => [klass.name, klass])));
    rules.forEach(this.importRule.bind(this));
  }

  /**
    * Select a file path and get its contents.
    */
  async load(path: string, content: ArrayBuffer) {
    this.path.next(path);

    // Convert data to python.
    const pyodide = window.pyscript.interpreter.interpreter;
    const locals = pyodide.toPy({ path, view: content });

    const analyzedData = pyodide.runPython("loadOwl(path, view)", { locals }).toJs();
    const klasses = analyzedData.get("classes").map(klassFromDeserialized);
    const rules = analyzedData.get("rules").map(ruleFromDeserialized);
    this.importData(klasses, rules);
  }

  save() {
    // const pyodide = window.pyscript.interpreter.interpreter;
    // const locals = pyodide.toPy({ path: this.path, rules: this.rules.table.getValue() });
    //
    // pyodide.runPython("storeRules(path, rules)", { locals });
  }
}

export const owlFile = new OwlFile();
