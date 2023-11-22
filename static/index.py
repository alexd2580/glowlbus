from typing import Generator, Optional, Any
import owlready2
from owlready2 import swrl
from io import BytesIO


def loadOwl(path: str, view: memoryview):
    """Load an ontology from a memoryview."""
    file_obj = BytesIO(view)
    ontology = owlready2.get_ontology(f"file://{path}").load(fileobj=file_obj)

    klasses = list(extract_klasses(ontology))
    rules = list(extract_rules(ontology))

    return {"classes": klasses, "rules": rules}


def extract_klasses(ontology: owlready2.Ontology) -> Generator[dict, None, None]:
    for klass in ontology.classes():
        # Collect properties.
        object_properties = []
        datatype_properties = []

        equiv_to = klass.equivalent_to
        if len(equiv_to) == 1:
            and_ = equiv_to[0]
            and_klasses = and_.Classes

            for and_klass in and_klasses:
                prop = and_klass.property()

                if len(prop.is_a) != 1:
                    print("unexpected is_a", prop.is_a)
                    continue
                is_a = prop.is_a[0].name

                relations = list(prop.get_relations())
                if len(relations) != 1:
                    print("unexpected relations", relations)
                    continue

                relation = relations[0]
                if len(relation) != 2:
                    print("unexpected relation", relation)
                    continue

                if is_a == "ObjectProperty":
                    typ = relation[1]._name
                    object_properties.append({ "name": prop._name, "type": typ })
                elif is_a == "DatatypeProperty":
                    typ = type(relation[1]).__name__
                    datatype_properties.append({ "name": prop._name, "type": typ })

        if len(equiv_to) > 1:
            print("Unexpected equiv_to", equiv_to)

        yield {
            "name": klass.name,
            "object_properties": object_properties,
            "datatype_properties": datatype_properties,
        }


def handle_arguments(clause: swrl.Imp) -> list[Any]:
    return [
        {"variable": arg.name} if type(arg) == swrl.Variable else arg
        for arg in clause.arguments
    ]


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
        "arguments": handle_arguments(clause),
    }


def extract_rules(ontology: owlready2.Ontology) -> Generator[dict, None, None]:
    for rule in ontology.rules():
        label = "Unnamed rule" if len(rule.label) != 1 else rule.label[0]
        enabled = None if len(rule.isRuleEnabled) != 1 else rule.isRuleEnabled[0]

        yield {
            "name": label,
            "enabled": enabled,
            "clauses": [extract_clause(c) for c in rule.body],
        }
