import * as React from "react";
import { Button, Card, Container, Form, Grid, Menu } from "semantic-ui-react";
import * as R from "ramda";

import { fileDialog } from "./models/file-dialog";
import { owlFile } from "./models/owl-file";

import { LoadingOverlay } from "./components/loading-overlay";
import { KlassCard } from "./components/klass-card";
import { RuleCard } from "./components/rule-card";
import { LoadFileButton } from "./components/load-file-button";
import { SaveFileAsButton } from "./components/save-file-as-button";

import { useObservable } from "./utils/use-observable";

export const App = () => {
    const dialogVisible = useObservable(fileDialog.visible);
    const path = useObservable(owlFile.path);
    return (
        <>
            <Menu attached='top' inverted>
                <Container>
                    <Menu.Item as={LoadFileButton} />
                    <Menu.Item as={SaveFileAsButton} />
                </Container>
            </Menu>
            <LoadingOverlay active={dialogVisible} style={{ backgroundColor: "#A5D8DD", padding: 0, margin: 0, height: "calc(100% - 40px)" }}>
                <Container fluid style={{ width: "90%", height: "100%", backgroundColor: "transparent" }}>
                    {typeof path === "undefined" ? <LoadFile /> : <EditFile />}
                </Container>
            </LoadingOverlay>
        </>
    );
};

const LoadFile = () => {
    return (
        <Card>
            <Card.Content>
                <Card.Header>Hello</Card.Header>
                <Card.Description>Now we're running python and semantic ui. TODO remove this?</Card.Description>
            </Card.Content>
            <Card.Content extra>
                <LoadFileButton />
            </Card.Content>
        </Card>
    );
};

const EditFile = () => {
    const klassIds = useObservable(owlFile.klasses.keys());
    const ruleIds = useObservable(owlFile.rules.keys());
    return (
        <Grid columns={2} style={{ margin: 0, height: "100%" }}>
            <Grid.Column style={{ height: "100%", overflow: "scroll" }} width={5}>
                {
                    R.isEmpty(klassIds)
                        ? <p>No classes loaded.</p>
                        : klassIds.map(id => <KlassCard key={id} id={id} />)
                }
            </Grid.Column>

            <Grid.Column style={{ height: "100%", overflow: "scroll" }} width={11}>
                {
                    R.isEmpty(ruleIds)
                        ? <p>No rules loaded.</p>
                        : ruleIds.map(id => <RuleCard key={id} id={id} />)
                }
                <Form>
                    <Form.Field>
                        <Button icon="add" color="blue" content="Add rule" onClick={owlFile.addRule} />
                    </Form.Field>
                </Form>
            </Grid.Column>
        </Grid >
    );
};
