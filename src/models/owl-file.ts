import { BehaviorSubject, Observable, combineLatestWith, filter, map } from "rxjs";
import { Klass, Property, klassFromDeserialized } from "./klass";
import { Clause, Rule, Variable, ruleFromDeserialized } from "./rule";
import * as R from "ramda";
import { distinct, filterUndefined } from "../utils/operators";
import { Table, Set } from "../utils/observable-tables";

function expectVariable(v: string) {
  if (v?.[0] !== "?") {
    throw `Expected variable, got ${v}`;
  }
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

export interface EnhancedRule extends Omit<Rule, "body"> {
  objektIds: string[];
  relationIds: string[];
}

export class OwlFile {
  path: BehaviorSubject<string | undefined>;
  file_content: ArrayBuffer | undefined;
  baseIri: string | undefined;

  // These are constant, just deserialized to give a better overview of the rule composition.
  klasses: BehaviorSubject<{ [className: string]: Klass }>;

  builtins: Set<string>;
  relationFunctions: Set<string>;

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

  hoveredObjekt: BehaviorSubject<string | undefined>;

  constructor() {
    this.path = new BehaviorSubject(undefined as string | undefined);
    this.file_content = undefined;
    this.baseIri = undefined;

    this.klasses = new BehaviorSubject({});
    this.builtins = new Set();
    this.relationFunctions = new Set();
    this.rules = new Table();
    this.objekts = new Table();
    this.datavalues = new Table();
    this.datavaluesExpanded = new Table();
    this.conditions = new Table();
    this.relations = new Table();
    this.hoveredObjekt = new BehaviorSubject(undefined as string | undefined);

    // TODO remove this.
    // this.path.next("lol.rofl");
    // this.importData(klasses, rules);
  }

  hoveredKlass(): Observable<string | undefined> {
    return this.hoveredObjekt.pipe(
      combineLatestWith(this.objekts.entities),
      map(([id, objekts]) => id && objekts[id]?.klass),
      distinct()
    );
  }

  datavalueConditions(datavalueId: string): Observable<Condition[]> {
    const { datavalues, conditions } = this;
    return datavalues.byId(datavalueId).pipe(
      filterUndefined(),
      map(x => x.conditionIds),
      combineLatestWith(conditions.entities),
      map(([ids, conditions]) => ids.map(id => conditions[id]))
    );
  }

  datavalueOptions(objektId: string): Observable<string[]> {
    return this.objekts.byId(objektId).pipe(
      map(x => x?.klass),
      filterUndefined(),
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
          type: { type: "primitive", value: "any" }
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
      .filter(clause => clause.args[0] === instance)
      .map(clause => {
        if (clause.args.length !== 2) {
          throw `Got wrong number of arguments for builtin: ${JSON.stringify(clause)}`;
        }
        this.builtins.add(clause.name);
        return this.conditions.add({ builtin: clause.name, value: clause.args[1] });
      });
  }

  // The datavalue clause attaches the property `name` to the object `args[0]` using the variable `args[1]`.
  // It can also set a value directly, when `args[1]` is not a variable but a value.
  importDatavalue(datavalueClause: Clause, builtinClauses: Clause[]): string {
    if (datavalueClause.args.length !== 2) {
      throw `Unexpected datavalue clause: ${datavalueClause}`;
    }

    const varOrValue = datavalueClause.args[1];
    if (varOrValue[0] === "?") {
      // We're dealing with a variable and some builting operators applied to it.
      const instance = varOrValue;
      return this.datavalues.add({
        field: datavalueClause.name,
        instance,
        conditionIds: this.importConditionsForInstance(instance, builtinClauses),
      });
    } else {
      // We're dealing with a value.
      this.builtins.add("exactly");
      return this.datavalues.add({
        field: datavalueClause.name,
        instance: undefined,
        conditionIds: [this.conditions.add({ builtin: "exactly", value: varOrValue?.toString() })]
      });
    }
  }

  importDatavaluesForObjekt(name: string, datavalueClauses: Clause[], builtinClauses: Clause[]): string[] {
    return datavalueClauses
      .filter(clause => clause.args[0] === name)
      .map(datavalueClause => this.importDatavalue(datavalueClause, builtinClauses));
  }

  importObjekt(objektClause: Clause, datavalueClauses: Clause[], builtinClauses: Clause[]): string {
    const { name: klass, args } = objektClause;
    if (args.length !== 1) {
      throw `Unexpected multivariable class clause: ${objektClause}`;
    }

    const name = args[0];
    expectVariable(name);
    const datavalueIds = this.importDatavaluesForObjekt(name, datavalueClauses, builtinClauses);
    return this.objekts.add({ name, klass, datavalueIds });
  }

  importRelation(clause: Clause): string {
    const { type, name, args } = clause;
    if (type !== "property") {
      throw `Unexpected non-property relation clause: ${clause}`;
    }
    this.relationFunctions.add(name);
    return this.relations.add({ name, variables: args });
  }

  importRule(rule: Rule) {
    const clauses: { [key: string]: Clause[] } = { class: [], datavalue: [], builtin: [], property: [] };
    rule.body.forEach(clause => clauses[clause.type].push(clause));

    let objektIds = clauses.class.map(objektClause => this.importObjekt(objektClause, clauses.datavalue, clauses.builtin));
    let relationIds = clauses.property.map(propertyClause => this.importRelation(propertyClause));

    this.rules.add({ label: rule.label, enabled: rule.enabled, objektIds, relationIds, head: rule.head });
  }

  importData(klasses: Klass[], rules: Rule[]) {
    this.klasses.next(Object.fromEntries(klasses.map(klass => [klass.name, klass])));
    rules.forEach(this.importRule.bind(this));
  }

  /**
    * Select a file path and get its contents.
    */
  async importFromSerialized(path: string, content: ArrayBuffer) {
    // TODO Clear all previous data.
    this.file_content = content;
    this.path.next(path);

    // Convert data to python.
    const pyodide = window.pyscript.interpreter.interpreter;
    const locals = pyodide.toPy({ path, view: content });

    const analyzedData = pyodide.runPython("load_owl(path, view)", { locals }).toJs();
    const klasses = analyzedData.get("classes").map(klassFromDeserialized);
    const rules = analyzedData.get("rules").map(ruleFromDeserialized);

    this.baseIri = analyzedData.get("base_iri");
    this.importData(klasses, rules);
  }

  serializeCondition(instance: string, conditionId: string): Clause[] {
    const { builtin, value } = this.conditions.get(conditionId);
    return [
      { type: "builtin", name: builtin, args: [instance, value] },
    ];
  }

  serializeDatavalue(name: string, datavalueId: string): Clause[] {
    const { field, instance, conditionIds } = this.datavalues.get(datavalueId);
    if (conditionIds.length === 1) {
      const { builtin, value } = this.conditions.get(conditionIds[0]);
      if (builtin === "exactly") {
        return [{ type: "datavalue", name: field, args: [name, value] }];
      }
    }
    return [
      { type: "datavalue", name: field, args: [name, instance] },
      ...conditionIds.flatMap(id => this.serializeCondition(instance, id)),
    ];
  }

  serializeObjekt(objektId: string): Clause[] {
    const { name, klass, datavalueIds } = this.objekts.get(objektId);

    return [
      { type: "class", name: klass, args: [name] },
      ...datavalueIds.flatMap(id => this.serializeDatavalue(name, id)),
    ];
  }

  serializeRelation(relationId: string): Clause[] {
    const { name, variables } = this.relations.get(relationId);
    return [
      { type: "property", name, args: variables }
    ];
  }

  serialize(): Buffer {
    const rules = Object.values(this.rules.entities.getValue()).map(rule => ({
        label: rule.label,
        enabled: rule.enabled,
        body: [
          ...rule.objektIds.flatMap(this.serializeObjekt.bind(this)),
          ...rule.relationIds.flatMap(this.serializeRelation.bind(this)),
        ],
        head: rule.head,
    }));

    const pyodide = window.pyscript.interpreter.interpreter;
    const locals = pyodide.toPy({ base_iri: this.baseIri, rules, old_data: this.file_content });
    const result = pyodide.runPython("save_rules(base_iri, rules, old_data)", { locals }).toJs();
    return result.getvalue().getBuffer(); // TODO this is not a `buffer`.
  }
}

export const owlFile = new OwlFile();
