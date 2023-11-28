import { BehaviorSubject, Observable, combineLatestWith, map } from "rxjs";
import * as R from "ramda";

import { Klass, Property, klassFromDeserialized } from "./klass";
import { Clause, Rule, ruleFromDeserialized } from "./rule";
import { Condition, Datavalue, EnhancedRule, Implication, Objekt, Relation } from "./interfaces";

import { distinctUntilChanged, prop } from "../utils/operators";
import { RxMap, RxTable, RxSet } from "../utils/observable-tables";
import { ID } from "../utils/id";
import { runPython } from "../utils/python";

function expectVariable(v: string) {
  if (v?.[0] !== "?") {
    throw `Expected variable, got ${v}`;
  }
}

export class OwlFile {
  // The loaded file path.
  path: BehaviorSubject<string | undefined>;

  // The content of the loaded file (not reactive).
  fileContent: ArrayBuffer | undefined;

  // The IRI of the loaded file (not reactive).
  baseIri: string | undefined;

  // These are constant, just deserialized to give a better overview of the rule composition.
  klasses: RxMap<string, Klass>;

  // Set of builtin comparison functions, collected from loaded file.
  builtins: RxSet<string>;

  // Set of known relation functions, collected from loaded file.
  relationFunctions: RxSet<string>;

  // A rule is composed of objekts (and their datavalues) and relations between objects.
  rules: RxTable<ID<"Rule">, EnhancedRule>;

  // Instances of classes.
  objekts: RxTable<ID<"Objekt">, Objekt>;

  // Members of instances.
  datavalues: RxTable<ID<"Datavalue">, Datavalue>;

  // A map holding which datavalue details accordion is expanded.
  datavaluesExpanded: RxMap<ID<"Datavalue">, boolean>;

  // Conditions on datavalues.
  conditions: RxTable<ID<"Condition">, Condition>;

  // Inter-object relations.
  relations: RxTable<ID<"Relation">, Relation>;

  // Statements that follow from the truthiness of the the rule body.
  implications: RxTable<ID<"Implication">, Implication>;

  // Id of the currently hovered objekt.
  hoveredObjekt: BehaviorSubject<ID<"Objekt"> | undefined>;

  constructor() {
    this.path = new BehaviorSubject(undefined) as typeof this.path;
    this.fileContent = undefined;
    this.baseIri = undefined;

    this.klasses = new RxMap();
    this.builtins = new RxSet();
    this.relationFunctions = new RxSet();

    this.rules = new RxTable();
    this.objekts = new RxTable();
    this.datavalues = new RxTable();
    this.datavaluesExpanded = new RxMap();
    this.conditions = new RxTable();
    this.relations = new RxTable();
    this.implications = new RxTable();

    this.hoveredObjekt = new BehaviorSubject(undefined) as typeof this.hoveredObjekt;

    // TODO remove this.
    // this.path.next("lol.rofl");
    // this.importData(klasses, rules);
  }

  // Emits the currently hovered klass name or undefined if no class is hovered.
  hoveredKlass(): Observable<string | undefined> {
    return this.hoveredObjekt.pipe(
      combineLatestWith(this.objekts.entries),
      map(([id, objekts]) => id && objekts[id]?.klass),
      distinctUntilChanged()
    );
  }

  datavalueConditions(datavalueId: ID<"Datavalue">): Observable<Condition[]> {
    return this.datavalues.byId(datavalueId).pipe(
      prop("conditionIds"),
      combineLatestWith(this.conditions.entries),
      map(([ids, conditions]) => ids.map(id => conditions[id]!))
    );
  }

  datavalueOptions(objektId: ID<"Objekt">): Observable<string[]> {
    return this.objekts.byId(objektId).pipe(
      prop("klass"),
      combineLatestWith(this.klasses.entries),
      map(([klassName, klasses]) => {
        // Why does TS fail to deduce the type of `properties`?
        const properties = R.path([klassName, "datatypeProperties"], klasses) as Property[] | undefined;
        return properties !== undefined ? R.pluck("name", properties) : [];
      }),
    ) as Observable<string[]>;
  }

  addDatavalueOption(objektId: ID<"Objekt">, name: string) {
    const { klass } = this.objekts.get(objektId)!;
    this.klasses.alter(klass, oldKlass => oldKlass && {
      ...oldKlass,
      datatypeProperties: [
        ...oldKlass.datatypeProperties,
        {
          name,
          type: { type: "primitive", value: "any" }
        }
      ]
    });
  }

  addRule() {
    this.rules.add({
      label: "",
      enabled: true,
      objektIds: [],
      relationIds: [],
      implicationIds: [],
    });
  }

  addObjekt(ruleId: ID<"Rule">) {
    const objekt = { name: "", klass: "", datavalueIds: [] };
    const newId = this.objekts.add(objekt);
    this.rules.alterField(ruleId, "objektIds", R.append(newId));
  }

  addDatavalue(objektId: ID<"Objekt">) {
    const datavalue = { field: "", instance: "", conditionIds: [] };
    const newId = owlFile.datavalues.add(datavalue);
    owlFile.datavaluesExpanded.set(newId, true);
    owlFile.objekts.alterField(objektId, "datavalueIds", R.append(newId));
  }

  addCondition(datavalueId: ID<"Datavalue">, value?: Condition) {
    const condition = value ?? { builtin: "", value: "" };
    const newId = owlFile.conditions.add(condition);
    owlFile.datavalues.alterField(datavalueId, "conditionIds", R.append(newId));
  }

  addRelation(ruleId: ID<"Rule">) {
    const relation = { name: "", args: [] };
    const newId = this.relations.add(relation);
    this.rules.alterField(ruleId, "relationIds", R.append(newId));
  }

  addImplication(ruleId: ID<"Rule">, value?: Implication) {
    const implication = value ?? { name: "", args: [] };
    const newId = owlFile.implications.add(implication);
    owlFile.rules.alterField(ruleId, "implicationIds", R.append(newId));
  }

  removeCondition(conditionId: ID<"Condition">, parentId?: ID<"Datavalue">) {
    parentId && this.datavalues.alterField(parentId, "conditionIds", R.without([conditionId]));
    this.conditions.remove(conditionId);
  }

  removeDatavalue(datavalueId: ID<"Datavalue">, parentId?: ID<"Objekt">) {
    parentId && this.objekts.alterField(parentId, "datavalueIds", R.without([datavalueId]));
    this.datavalues.get(datavalueId)?.conditionIds.forEach(id => this.removeCondition(id));
    this.datavalues.remove(datavalueId);
  }

  removeObjekt(objektId: ID<"Objekt">, parentId?: ID<"Rule">) {
    parentId && this.rules.alterField(parentId, "objektIds", R.without([objektId]));
    this.objekts.get(objektId)?.datavalueIds.forEach(id => this.removeDatavalue(id));
    this.objekts.remove(objektId);
  }

  removeRelation(relationId: ID<"Relation">, parentId?: ID<"Rule">) {
    parentId && this.rules.alterField(parentId, "relationIds", R.without([relationId]));
    this.relations.remove(relationId);
  }

  removeImplication(implicationId: ID<"Implication">, parentId?: ID<"Rule">) {
    parentId && this.rules.alterField(parentId, "implicationIds", R.without([implicationId]));
    this.implications.remove(implicationId);
  }

  removeRule(ruleId: ID<"Rule">) {
    const rule = this.rules.get(ruleId);
    rule?.objektIds.forEach(id => this.removeObjekt(id));
    rule?.relationIds.forEach(id => this.removeRelation(id));
    rule?.implicationIds.forEach(id => this.removeImplication(id));
    this.rules.remove(ruleId);
  }

  clear() {
    this.klasses.clear();
    this.builtins.clear();
    this.relationFunctions.clear();
    this.rules.clear();
    this.objekts.clear();
    this.datavalues.clear();
    this.datavaluesExpanded.clear();
    this.conditions.clear();
    this.relations.clear();
    this.implications.clear();

    this.hoveredObjekt.next(undefined);
  }

  importConditionsForInstance(instance: string, builtinClauses: Clause[]): ID<"Condition">[] {
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
  importDatavalue(datavalueClause: Clause, builtinClauses: Clause[]): ID<"Datavalue"> {
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
        instance: "",
        conditionIds: [this.conditions.add({ builtin: "exactly", value: varOrValue?.toString() })]
      });
    }
  }

  importObjekt(objektClause: Clause, datavalueClauses: Clause[], builtinClauses: Clause[]): ID<"Objekt"> {
    const { name: klass, args } = objektClause;
    if (args.length !== 1) {
      throw `Unexpected multivariable class clause: ${objektClause}`;
    }

    const name = args[0];
    expectVariable(name);
    const datavalueIds = datavalueClauses
      .filter(clause => clause.args[0] === name)
      .map(clause => this.importDatavalue(clause, builtinClauses));
    return this.objekts.add({ name, klass, datavalueIds });
  }

  importRelation(clause: Clause): ID<"Relation"> {
    const { name, args } = clause;
    this.relationFunctions.add(name);
    return this.relations.add({ name, args: args });
  }

  importImplication(clause: Clause): ID<"Implication"> {
    const { name, args } = clause;
    return this.implications.add({ name, args });
  }

  importRule(rule: Rule) {
    const clauses: { [key: string]: Clause[] } = { class: [], datavalue: [], builtin: [], property: [] };
    rule.body.forEach(clause => clauses[clause.type].push(clause));

    let objektIds = clauses.class.map(objektClause => this.importObjekt(objektClause, clauses.datavalue, clauses.builtin));
    let relationIds = clauses.property.map(propertyClause => this.importRelation(propertyClause));
    let implicationIds = rule.head.map(implicationClause => this.importImplication(implicationClause));

    this.rules.add({ label: rule.label, enabled: rule.enabled, objektIds, relationIds, implicationIds });
  }

  /**
    * Select a file path and get its contents.
    */
  async importFromSerialized(path: string, content: ArrayBuffer) {
    this.clear();

    this.path.next(path);
    this.fileContent = content;

    const analyzedData = runPython("load_owl(path, view)", { path, view: content });
    this.baseIri = analyzedData.get("base_iri");
    (analyzedData.get("classes") as Map<string, any>[]).map(klassFromDeserialized).forEach(klass => this.klasses.set(klass.name, klass));
    (analyzedData.get("rules") as Map<string, any>[]).map(ruleFromDeserialized).forEach(rule => this.importRule(rule));
  }

  serializeCondition(instance: string, conditionId: ID<"Condition">): Clause {
    const { builtin, value } = this.conditions.get(conditionId)!;
    return { type: "builtin", name: builtin, args: [instance, value] };
  }

  serializeDatavalue(name: string, datavalueId: ID<"Datavalue">): Clause[] {
    const { field, instance, conditionIds } = this.datavalues.get(datavalueId)!;
    if (conditionIds.length === 1) {
      const { builtin, value } = this.conditions.get(conditionIds[0])!;
      if (builtin === "exactly") {
        return [{ type: "datavalue", name: field, args: [name, value] }];
      }
    }
    return [
      { type: "datavalue", name: field, args: [name, instance] },
      ...conditionIds.map(id => this.serializeCondition(instance, id)),
    ];
  }

  serializeObjekt(objektId: ID<"Objekt">): Clause[] {
    const { name, klass, datavalueIds } = this.objekts.get(objektId)!;

    return [
      { type: "class", name: klass, args: [name] },
      ...datavalueIds.flatMap(id => this.serializeDatavalue(name, id)),
    ];
  }

  serializeRelation(relationId: ID<"Relation">): Clause {
    const { name, args } = this.relations.get(relationId)!;
    return { type: "property", name, args };
  }

  serializeImplication(implicationId: ID<"Implication">): Clause {
    const { name, args } = this.implications.get(implicationId)!;
    return { type: "datavalue", name, args }; // Is this actually a datavalue?
  }

  serialize(): Uint8Array {
    const rules = this.rules.getValues().map(rule => ({
      label: rule.label,
      enabled: rule.enabled,
      body: [
        ...rule.objektIds.flatMap(this.serializeObjekt.bind(this)),
        ...rule.relationIds.map(this.serializeRelation.bind(this)),
      ],
      head: rule.implicationIds.map(this.serializeImplication.bind(this)),
    }));

    return runPython(
      "save_rules(base_iri, rules, old_data)",
      { base_iri: this.baseIri, rules, old_data: this.fileContent },
    )
  }
}

export const owlFile = new OwlFile();
