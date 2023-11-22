export interface Property {
  name: string,
  type: string,
}

export interface Klass {
  name: string,
  objectProperties: Property[],
  datatypeProperties: Property[],
}

function propertyFromDeserialized(data: Map<string, string>): Property {
  return {
    name: data.get("name")!,
    type: data.get("type")!
  };
}

export function klassFromDeserialized(data: Map<string, any>): Klass {
  return {
    name: data.get("name"),
    objectProperties: data.get("object_properties").map(propertyFromDeserialized),
    datatypeProperties: data.get("datatype_properties").map(propertyFromDeserialized),
  }
}
