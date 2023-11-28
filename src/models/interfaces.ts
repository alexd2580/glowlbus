import { ID } from "../utils/id";
import { Rule } from "./rule";

export interface Condition {
  builtin: string | "exactly",
  value: string
};

export interface Datavalue {
  field: string,
  instance: string,
  conditionIds: ID<"Condition">[],
};

export interface Objekt {
  name: string,
  klass: string,
  datavalueIds: ID<"Datavalue">[],
};

export interface Relation {
  name: string,
  args: string[],
};

export interface Implication {
  name: string,
  args: string[],
};

export interface EnhancedRule extends Omit<Rule, "body" | "head"> {
  objektIds: ID<"Objekt">[],
  relationIds: ID<"Relation">[],
  implicationIds: ID<"Implication">[],
};
