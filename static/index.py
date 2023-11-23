from typing import Generator, Optional, Any
import owlready2
from owlready2 import swrl
from io import BytesIO


def load_owl(path: str, view: memoryview):
    """Load an ontology from a memoryview."""
    file_obj = BytesIO(view)
    ontology = owlready2.get_ontology(f"file://{path}").load(fileobj=file_obj)

    klasses = list(extract_klasses(ontology))
    rules = list(extract_rules(ontology))

    return {"base_iri": ontology.base_iri, "classes": klasses, "rules": rules}


PRIMITIVES = (bool, str, int, float)

rare = None
def get_ontology_type(value):
    if value in PRIMITIVES:
        return {"type": "primitive", "value": value.__name__}
    elif isinstance(value, PRIMITIVES):
        return {"type": "value", "value": value}
    elif hasattr(value, "name"):
        return {"type": "class", "value": value.name}
    else:
        print(f"Unknown type: {value}")
        return None


COMPLEX_CLASSES = (owlready2.class_construct.Or, owlready2.class_construct.And)


def extract_klasses(ontology: owlready2.Ontology) -> Generator[dict, None, None]:
    # TODO no idea what this is about, but for some ontologies, it fails to just read `Vessel` for example....
    for klass in ontology.classes():
        object_properties = []
        datatype_properties = []

        properties = {
            "ObjectProperty": object_properties,
            "DatatypeProperty": datatype_properties,
        }

        equiv_to = klass.equivalent_to
        if len(equiv_to) == 1:
            queue = [equiv_to[0]]

            while len(queue) > 0:
                item = queue.pop()
                if isinstance(item, COMPLEX_CLASSES):
                    queue.extend(item.Classes)
                else:
                    property = item.property()
                    relation = property._name
                    typ = property.is_a[0].name
                    value = item.value

                    queue2 = [value]
                    while len(queue2) > 0:
                        item2 = queue2.pop()
                        if isinstance(item2, COMPLEX_CLASSES):
                            queue2.extend(item2.Classes)
                        else:
                            properties[typ].append({ "name": relation, "type": get_ontology_type(item2) })

        if len(equiv_to) > 1:
            print("Unexpected equiv_to", equiv_to)

        yield {
            "name": klass.name,
            "object_properties": object_properties,
            "datatype_properties": datatype_properties,
        }


def handle_arguments(clause: swrl.Imp) -> list[str]:
    return [f"'{arg}'" if type(arg) == str else (str(arg).lower() if type(arg) == bool else str(arg)) for arg in clause.arguments]


def extract_clause(clause: swrl.Imp) -> Optional[dict[str, Any]]:
    typ = type(clause)
    name = None
    if typ == swrl.BuiltinAtom:
        typ = "builtin"
        name = clause.builtin if type(clause.builtin) == str else clause.builtin.name
    elif typ == swrl.ClassAtom:
        typ = "class"
        name = clause.class_predicate.name
    elif typ == swrl.DatavaluedPropertyAtom:
        typ = "datavalue"
        name = clause.property_predicate.name
    elif typ == swrl.IndividualPropertyAtom:
        typ = "property"
        name = clause.property_predicate.name
    else:
        print("unexpected rule clause", clause)

    return {
        "type": typ,
        "name": name,
        "args": handle_arguments(clause),
    }


def extract_rules(ontology: owlready2.Ontology) -> Generator[dict, None, None]:
    for rule in ontology.rules():
        label = "Unnamed rule" if len(rule.label) != 1 else rule.label[0]
        enabled = None if len(rule.isRuleEnabled) != 1 else rule.isRuleEnabled[0]

        yield {
            "label": label,
            "enabled": enabled,
            "body": [extract_clause(c) for c in rule.body],
            "head": [extract_clause(c) for c in rule.head],
        }

def build_clause_string(clause: dict) -> str:
    return f"{clause['name']}({', '.join(clause['args'])})"

def build_rule_string(rule: dict) -> str:
    body_clauses = (build_clause_string(c) for c in rule["body"])
    head_clauses = (build_clause_string(c) for c in rule["head"])
    return f"{', '.join(body_clauses)} -> {', '.join(head_clauses)}"

def save_rules(base_iri: str, rules: list[dict], old_data: memoryview):
    new_file_obj = BytesIO()

    old_file_obj = BytesIO(old_data)
    ontology = owlready2.get_ontology(base_iri).load(fileobj=old_file_obj)

    with ontology:
        # Delete all previous rules.
        while rule := next(ontology.rules(), None):
            owlready2.prop.destroy_entity(rule)

        # Create all new rules.
        for rule in rules:
            imp = owlready2.swrl.Imp()

            as_string = build_rule_string(rule)
            imp.set_as_rule(as_string)
            imp.label = [rule["label"]]
            imp.isRuleEnabled = rule["enabled"]

        ontology.save(file=new_file_obj)

    return new_file_obj
