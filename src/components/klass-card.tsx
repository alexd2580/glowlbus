import * as React from "react";
import { Card, Table } from "semantic-ui-react";
import { map } from "rxjs";

import { owlFile } from "../models/owl-file";

import { useObservable } from "../utils/use-unwrap";
import { distinct } from "../utils/operators";

export interface KlassCardProps {
    id: string;
}

export const KlassCard = ({ id }: KlassCardProps) => {
    const observable = owlFile.klasses.pipe(map(klasses => klasses[id]), distinct());
    const { name, objectProperties, datatypeProperties } = useObservable(observable);
    const highlight = name === useObservable(owlFile.hoveredKlass());
    const highlightColor = highlight ? { backgroundColor: "#CFCFCF" } : {};
    return (
        <Card style={{ width: "100%", transition: "background-color 0.5s ease", ...highlightColor }}>
            <Card.Content>
                <Card.Header>
                    <span style={{ color: "grey" }}>Class: </span>
                    {name}
                </Card.Header>
            </Card.Content>

            <Card.Content>
                <Table basic="very" compact="very" columns={3}>
                    <Table.Body>
                        {objectProperties.map((prop, index) => (
                            <Table.Row key={`o${index}`}>
                                <Table.Cell>{prop.name}</Table.Cell>
                                <Table.Cell>{prop.type.type}</Table.Cell>
                                <Table.Cell>{prop.type.value.toString()}</Table.Cell>
                            </Table.Row>
                        ))}
                        {datatypeProperties.map((prop, index) => (
                            <Table.Row key={`d${index}`}>
                                <Table.Cell>{prop.name}</Table.Cell>
                                <Table.Cell>{prop.type.type}</Table.Cell>
                                <Table.Cell>{prop.type.value.toString()}</Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            </Card.Content>
        </Card >
    );
};
