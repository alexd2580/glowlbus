import * as React from "react";
import { Button, Card, Form } from "semantic-ui-react";
import * as R from "ramda";

import { owlFile } from "../models/owl-file";

import { ObjektCard } from "./objekt-card";
import { RelationCard } from "./relation-card";

import { useObservable } from "../utils/use-unwrap";
import { IdProps } from "../utils/generic-props";

export const RuleCard = ({ id }: IdProps) => {
    const { label, objektIds, relationIds } = useObservable(owlFile.rules.byId(id));
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

            {/* Objekt cards. */}
            <Card.Content>
                <h3>Objects</h3>
                {objektIds.map(oId => <ObjektCard key={oId} id={oId} parentId={id} />)}
            </Card.Content>

            {/* Relation cards. */}
            <Card.Content>
                <h3>Relations</h3>
                {relationIds.map(rId => <RelationCard key={rId} id={rId} parentId={id} />)}
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
