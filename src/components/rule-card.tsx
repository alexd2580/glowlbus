import * as React from "react";
import { Button, Card, Form } from "semantic-ui-react";
import * as R from "ramda";

import { owlFile } from "../models/owl-file";

import { ObjektCard } from "./objekt-card";
import { RelationCard } from "./relation-card";

import { useObservable } from "../utils/use-unwrap";
import { IdProps, ParentProps } from "../utils/generic-props";

const isSome = (thing: any) => R.isNotNil(thing) && !R.isEmpty(thing);

const ImplicationForm = ({ id, parentId }: IdProps & ParentProps) => {
    const { name, args } = useObservable(owlFile.implications.byId(id));
    const setName = (value: string) => owlFile.implications.setField(id, "name", value);
    const setArg = (index: number, value: string) => owlFile.implications.alterField(id, "args", R.update(index, value));
    const addArg = (value: string | undefined) => {
        if (isSome(value)) {
            owlFile.implications.alterField(id, "args", R.append(value));
        }
    };
    const removeIfEmptyLast = (index: number, value: string) => {
        if (R.isEmpty(value)) {
            owlFile.implications.alterField(id, "args", R.remove(index, 1));
        }
    };
    const removeImplication = () => owlFile.removeImplication(id, parentId);
    return (
        <Form>
            <Form.Group widths="equal" style={{ alignItems: "center" }}>
                <Form.Input
                    key="-"
                    placeholder="Name..."
                    fluid
                    value={name}
                    onChange={event => setName(event.target.value)}
                />
                ({args.map((arg, index) => (
                    <>
                        <Form.Input
                            key={index}
                            placeholder='Argument...'
                            fluid
                            value={arg}
                            onChange={event => setArg(index, event.target.value)}
                            onBlur={event => removeIfEmptyLast(index, event.target.value as string)}
                        />,
                    </>
                ))}
                <Form.Input
                    key={args.length}
                    fluid
                    placeholder='Add argument...'
                    onBlur={event => addArg(event.target.value)}
                />)
                <Form.Button
                    icon='x'
                    color="red"
                    onClick={removeImplication}
                />

            </Form.Group>
        </Form>
    );
};

const AddImplicationForm = ({ parentId }: ParentProps) => {
    const addImplication = (name: string | undefined, arg: string | undefined) => {
        if (isSome(name) || isSome(arg)) {
            const newId = owlFile.implications.add({ name: name ?? "", args: [arg ?? ""] });
            owlFile.rules.alterField(parentId, "implicationIds", R.append(newId));
        }
    };
    return (
        <Form>
            <Form.Group widths="equal" style={{ alignItems: "center" }}>
                <Form.Input
                    placeholder="Name..."
                    fluid
                    onBlur={event => addImplication(event.target.value, undefined)}
                />
                (
                <Form.Input
                    placeholder='Argument...'
                    fluid
                    onBlur={event => addImplication(undefined, event.target.value)}
                />
                )
            </Form.Group>
        </Form>
    );
};

export const RuleCard = ({ id }: IdProps) => {
    const { label, objektIds, relationIds, implicationIds } = useObservable(owlFile.rules.byId(id));
    const setLabel = (value: string) => owlFile.rules.setField(id, "label", value);

    const addObjekt = () => {
        const newId = owlFile.objekts.add({
            name: "",
            klass: undefined,
            datavalueIds: []
        });
        owlFile.rules.alterField(id, "objektIds", R.append(newId));
    }
    const addRelation = () => {
        const newId = owlFile.relations.add({
            name: undefined,
            variables: [],
        });
        owlFile.rules.alterField(id, "relationIds", R.append(newId));
    }
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
                {objektIds.map(oId => <ObjektCard key={oId} id={oId} parentId={id} />)}
            </Card.Content>

            {/* Relations. */}
            <Card.Content>
                <h3>Relations</h3>
                {relationIds.map(rId => <RelationCard key={rId} id={rId} parentId={id} />)}
            </Card.Content>

            {/* Implications. */}
            <Card.Content>
                <h3>Implications</h3>
                {implicationIds.map(iId =>
                    <ImplicationForm
                        key={iId}
                        id={iId}
                        parentId={id}
                    />
                )}
                <AddImplicationForm
                    key={implicationIds.length}
                    parentId={id}
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
