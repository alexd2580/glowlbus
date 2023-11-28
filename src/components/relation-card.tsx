import * as React from "react";
import { Button, Card, Form } from "semantic-ui-react";
import * as R from "ramda";
import { map } from "rxjs";

import { owlFile } from "../models/owl-file";

import { Input } from "./input";
import { SearchAddDropdown } from "./search-add-dropdown";

import { useObservable } from "../utils/use-observable";
import { listAsOptions } from "../utils/list";
import { ID } from "../utils/id";

export const RelationCard = ({ id, ruleId }: { id: ID<"Relation">, ruleId: ID<"Rule"> }) => {
    const { name, args } = useObservable(owlFile.relations.byId(id));
    const options = useObservable(owlFile.relationFunctions.keys().pipe(map(listAsOptions)));

    const addRelationFunction = (value: string) => owlFile.relationFunctions.add(value);
    const setRelationFunction = (value: string) => owlFile.relations.setField(id, "name", value);
    const addVariable = (value: string) => owlFile.relations.alterField(id, "args", R.append(value));
    const setVariable = (index: number) => (value: string) => owlFile.relations.alterField(id, "args", R.update(index, value));
    const removeIfEmptyLast = (index: number) => (value: string) => {
        if (value === "") {
            owlFile.relations.alterField(id, "args", R.remove(index, 1));
        }
    };
    const removeRelation = () => owlFile.removeRelation(id, ruleId);
    return (
        <Card style={{ width: "100%" }}>
            <Card.Content>
                <Form size="small">
                    <SearchAddDropdown
                        fluid
                        width={5}
                        placeholder="Relation..."
                        options={options}
                        value={name}
                        onAddItem={addRelationFunction}
                        onChange={setRelationFunction}
                    />
                    <Form.Group widths="equal" style={{ margin: "0" }}>
                        {args.map((variable, index) => (
                            <Input
                                key={index}
                                fluid
                                placeholder="Variable..."
                                value={variable}
                                onChange={setVariable(index)}
                                onBlur={removeIfEmptyLast(index)}
                            />
                        ))}
                        <Input
                            key={args.length}
                            fluid
                            placeholder="More..."
                            onBlur={addVariable}
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
