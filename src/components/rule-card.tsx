import * as React from "react";
import { Button, Card, Form } from "semantic-ui-react";
import { owlFile } from "../models/owl-file";
import { useObservable } from "../utils/use-unwrap";
import * as R from "ramda";
import { IdProps } from "../utils/generic-props";
import { ObjektCard } from "./objekt-card";
import { RelationCard } from "./relation-card";

export const RuleCard = ({ id }: IdProps) => {
    const { name, objektIds, relationIds } = useObservable(owlFile.rules.byId(id));
    const setName = (value: string) => owlFile.rules.setField(id, "name", value);

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
            <Card.Content header>
                <h2 style={{ color: "grey" }}>Rule: </h2>
                <Form size="big">
                    <Form.Input
                        placeholder="Rule name..."
                        width={6}
                        value={name}
                        onChange={event => setName(event.target.value)}
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
