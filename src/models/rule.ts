export interface Clause {
  type: "builtin" | "class" | "datavalue" | "property",
  name: string,
  args: string[], // TODO
}

export interface Rule {
  label: string | undefined,
  enabled: boolean | undefined,
  body: Clause[],
  head: Clause[],
}

function clauseFromDeserialized(data: Map<string, any>): Clause {
  return {
    type: data.get("type"),
    name: data.get("name"),
    args: data.get("args"),
  };
}

export function ruleFromDeserialized(data: Map<string, any>): Rule {
  return {
    label: data.get("label"),
    enabled: data.get("enabled"),
    body: data.get("body").map(clauseFromDeserialized),
    head: data.get("head").map(clauseFromDeserialized),
  }
}
