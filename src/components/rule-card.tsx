import * as React from "react";
import { Button, Card, Form } from "semantic-ui-react";
import * as R from "ramda";

import { owlFile } from "../models/owl-file";

import { ObjektCard } from "./objekt-card";
import { RelationCard } from "./relation-card";

import { useObservable } from "../utils/use-observable";
import { ID } from "../utils/id";
import { Input } from "./input";

const ImplicationForm = ({ id, ruleId }: { id: ID<"Implication">, ruleId: ID<"Rule"> }) => {
    const { name, args } = useObservable(owlFile.implications.byId(id));

    const setName = (value: string) => owlFile.implications.setField(id, "name", value);
    const setArg = (index: number) => (value: string) => owlFile.implications.alterField(id, "args", R.update(index, value));
    const addArg = (value: string) => {
        if (value !== "") {
            owlFile.implications.alterField(id, "args", R.append(value));
        }
    };
    const removeIfEmptyLast = (index: number) => (value: string) => {
        if (value === "") {
            owlFile.implications.alterField(id, "args", R.remove(index, 1));
        }
    };
    const removeImplication = () => owlFile.removeImplication(id, ruleId);
    return (
        <Form>
            <Form.Group widths="equal" style={{ alignItems: "center" }}>
                <Input
                    key="-"
                    fluid
                    placeholder="Name..."
                    value={name}
                    onChange={setName}
                />
                ({args.map((arg, index) => (
                    <>
                        <Input
                            key={index}
                            fluid
                            placeholder='Argument...'
                            value={arg}
                            onChange={setArg(index)}
                            onBlur={removeIfEmptyLast(index)}
                        />,
                    </>
                ))}
                <Input key={args.length} fluid placeholder='Add argument...' onBlur={addArg} />)
                <Form.Button icon='x' color="red" onClick={removeImplication} />
            </Form.Group>
        </Form>
    );
};

const AddImplicationForm = ({ ruleId }: { ruleId: ID<"Rule"> }) => {
    const addImplication = (name: string, arg: string) => {
        if (name !== "" || arg !== "") {
            owlFile.addImplication(ruleId, { name: name ?? "", args: [arg ?? ""] });
        }
    };
    return (
        <Form>
            <Form.Group widths="equal" style={{ alignItems: "center" }}>
                <Input placeholder="Name..." fluid onBlur={value => addImplication(value, "")} />
                (<Input placeholder='Argument...' fluid onBlur={value => addImplication("", value)} />)
            </Form.Group>
        </Form>
    );
};

export const RuleCard = ({ id }: { id: ID<"Rule"> }) => {
    const { label, objektIds, relationIds, implicationIds } = useObservable(owlFile.rules.byId(id));

    const setLabel = (value: string) => owlFile.rules.setField(id, "label", value);
    const addObjekt = () => owlFile.addObjekt(id);
    const addRelation = () => owlFile.addRelation(id);
    const removeRule = () => owlFile.removeRule(id);

    return (
        <Card style={{ width: "100%", backgroundColor: "#F1F1F1", marginBottom: "30px" }}>
            {/* Generic rule data. */}
            <Card.Content>
                <h2 style={{ color: "grey" }}>Rule: </h2>
                <Form size="big">
                    <Form.Input
                        placeholder="Rule name..."
                        width={6}
                        value={label}
                        onChange={event => setLabel(event.target.value)}
                    />
                </Form>
            </Card.Content>

            {/* Objekts. */}
            <Card.Content>
                <h3>Objects</h3>
                {objektIds.map(oId => <ObjektCard key={oId} id={oId} ruleId={id} />)}
            </Card.Content>

            {/* Relations. */}
            <Card.Content>
                <h3>Relations</h3>
                {relationIds.map(rId => <RelationCard key={rId} id={rId} ruleId={id} />)}
            </Card.Content>

            {/* Implications. */}
            <Card.Content>
                <h3>Implications</h3>
                {implicationIds.map(iId =>
                    <ImplicationForm
                        key={iId}
                        id={iId}
                        ruleId={id}
                    />
                )}
                <AddImplicationForm
                    key={implicationIds.length}
                    ruleId={id}
                />
            </Card.Content>

            {/* Actions. */}
            <Card.Content extra>
                <Button.Group>
                    <Button icon="add" color="blue" content="Add object" onClick={addObjekt} />
                    <Button icon="add" color="blue" content="Add relation" onClick={addRelation} />
                    <Button icon="x" color="red" content="Remove rule" onClick={removeRule} />
                </Button.Group>
            </Card.Content>
        </Card>
    );
};
