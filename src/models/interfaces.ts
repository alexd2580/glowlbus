import { Rule } from "./rule";

export interface Condition {
  builtin: string | "exactly" | undefined,
  value: string | undefined
};

export interface Datavalue {
  field: string | undefined,
  instance: string | undefined,
  conditionIds: string[],
};

export interface Objekt {
  name: string | undefined,
  klass: string | undefined,
  datavalueIds: string[],
};

export interface Relation {
  name: string | undefined,
  variables: string[],
};

export interface Implication {
  name: string,
  args: string[],
};

export interface EnhancedRule extends Omit<Rule, "body" | "head"> {
  objektIds: string[],
  relationIds: string[],
  implicationIds: string[],
};
