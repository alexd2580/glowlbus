export interface Variable {
  variable: string
}

export interface Clause {
  type: "builtin" | "class" | "datavalue" | "property",
  name: string,
  args: any[], // TODO
}

export interface Rule {
  name: string | undefined,
  enabled: boolean | undefined,
  clauses: Clause[],
}

function variableFromDeserialized(data: Map<string, string>): Variable {
  return {
    variable: data.get("variable")!,
  };
}

function argumentFromDeserialized(data: Map<string, string> | any): Variable | any {
  if (data.constructor == Map) {
    return variableFromDeserialized(data);
  }
  return data;
}

function clauseFromDeserialized(data: Map<string, any>): Clause {
  return {
    type: data.get("type"),
    name: data.get("name"),
    args: data.get("arguments").map(argumentFromDeserialized),
  };
}

export function ruleFromDeserialized(data: Map<string, any>): Rule {
  return {
    name: data.get("name"),
    enabled: data.get("enabled"),
    clauses: data.get("clauses").map(clauseFromDeserialized),
  }
}
