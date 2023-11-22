import * as React from "react";
import { Card, Table } from "semantic-ui-react";
import { Klass } from "../models/klass";

export interface KlassCardProps {
    klass: Klass;
}

export const KlassCard = (props: KlassCardProps) => {
    const { name, objectProperties, datatypeProperties } = props.klass;
    return (
        <Card>
            <Card.Content>
                <Card.Header>
                    <span style={{color: "grey"}}>Class: </span>
                    {name}
                </Card.Header>
            </Card.Content>

            {objectProperties.length > 0 && (
                <Card.Content key="object-properties">
                    <Table>
                        <Table.Body>
                            {objectProperties.map((prop, index) => (
                                <Table.Row key={index}>
                                    <Table.Cell>{prop.name}</Table.Cell>
                                    <Table.Cell>{prop.type}</Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table>
                </Card.Content>
            )}
            {datatypeProperties.length > 0 && (
                <Card.Content key="datatype-properties">
                    <Table>
                        <Table.Body>
                            {datatypeProperties.map((prop, index) => (
                                <Table.Row key={index}>
                                    <Table.Cell>{prop.name}</Table.Cell>
                                    <Table.Cell>{prop.type}</Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table>
                </Card.Content>
            )}
        </Card >
    );
};
