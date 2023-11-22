import * as React from "react";
import { Button, Card, Form } from "semantic-ui-react";
import * as R from "ramda";
import { map } from "rxjs";

import { owlFile } from "../models/owl-file";

import { useObservable } from "../utils/use-unwrap";
import { IdProps, ParentProps } from "../utils/generic-props";
import { listAsOptions } from "../utils/list";

export const RelationCard = ({ id, parentId }: IdProps & ParentProps) => {
    const { name, variables } = useObservable(owlFile.relations.byId(id));
    const options = useObservable(owlFile.relationFunctions.values().pipe(map(listAsOptions)));

    const setRelation = (value: string) => owlFile.relations.setField(id, "name", value);
    const addVariable = (value: string) => owlFile.relations.alterField(id, "variables", R.append(value));
    const setVariable = (index: number, value: string) => owlFile.relations.alterField(id, "variables", R.update(index, value));
    const removeIfEmptyLast = (index: number, value: string) => {
        if (R.isEmpty(value)) {
            owlFile.relations.alterField(id, "variables", R.remove(index, 1));
        }
    };
    const removeRelation = () => owlFile.removeRelation(id, parentId);
    return (
        <Card style={{ width: "100%" }}>
            <Card.Content>
                <Form size="small">
                    <Form.Dropdown
                        placeholder="Relation..."
                        fluid
                        search
                        selection
                        options={options}
                        width={5}
                        value={name}
                        onChange={(_, data) => setRelation(data.value as string)}
                    />
                    <Form.Group widths="equal" style={{ margin: "0" }}>
                        {variables.map((variable, index) => (
                            <Form.Input
                                placeholder="Variable..."
                                fluid
                                key={index}
                                value={variable}
                                onChange={event => setVariable(index, event.target.value as string)}
                                onBlur={event => removeIfEmptyLast(index, event.target.value as string)}
                            />
                        ))}
                        <Form.Input
                            placeholder="More..."
                            fluid
                            key={variables.length}
                            onBlur={event => addVariable(event.target.value as string)}
                        />
                    </Form.Group>
                </Form>
            </Card.Content>

            <Card.Content extra>
                <Form.Field>
                    <Button icon="x" color="red" content="Remove relation" onClick={removeRelation} />
                </Form.Field>
            </Card.Content>
        </Card >
    );
};
