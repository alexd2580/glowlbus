export interface Property {
  name: string,
  type: { type: string, value: any },
}

export interface Klass {
  name: string,
  objectProperties: Property[],
  datatypeProperties: Property[],
}

function propertyFromDeserialized(data: Map<string, any>): Property {
  return {
    name: data.get("name")!,
    type: {
      type: data.get("type")!.get("type")!,
      value: data.get("type")!.get("value")!
    }
  };
}

export function klassFromDeserialized(data: Map<string, any>): Klass {
  return {
    name: data.get("name"),
    objectProperties: data.get("object_properties").map(propertyFromDeserialized),
    datatypeProperties: data.get("datatype_properties").map(propertyFromDeserialized),
  }
}
