import * as React from "react";
import { Button, Container, Form, Grid, Menu } from "semantic-ui-react";
import * as R from "ramda";

import { useObservable } from "./utils/use-unwrap";

import { fileDialog } from "./models/file-dialog";
import { owlFile } from "./models/owl-file";

import { LoadingOverlay } from "./components/loading-overlay";
import { KlassCard } from "./components/klass-card";
import { RuleCard } from "./components/rule-card";
import { LoadFile } from "./views/load-file";

export const App = () => {
    const dialogVisible = useObservable(fileDialog.visible);
    const path = useObservable(owlFile.path);

    return (
        <div style={{ display: "flex", flexFlow: "column nowrap" }}>
            <Menu attached='top' inverted>
                <Container>
                    <Menu.Item onClick={loadFile}>
                        Load File
                    </Menu.Item>
                    <Menu.Item onClick={saveFile}>
                        Save File
                    </Menu.Item>
                </Container>
            </Menu>
            <LoadingOverlay active={dialogVisible} style={{ backgroundColor: "#A5D8DD", padding: 0, flexGrow: 1 }}>
                <Container fluid style={{ width: "90%", height: "100vh", backgroundColor: "transparent" }}>
                    {typeof path !== "undefined" ? <EditFile /> : <LoadFile />}
                </Container>
            </LoadingOverlay>
        </div>
    );
};

const EditFile = () => {
    const klasses = useObservable(owlFile.klasses);
    const ruleIds = useObservable(owlFile.rules.ids());

    const addRule = () => owlFile.rules.add({
        name: "",
        enabled: true,
        objektIds: [],
        relationIds: [],
    });

    return (
        <Grid columns={2} style={{ margin: 0, height: "100%" }}>
            <Grid.Column style={{ height: "100%", overflow: "scroll" }} width={4}>
                {
                    R.isEmpty(klasses)
                        ? <p>No classes were loaded.</p>
                        : Object.values(klasses).map((klass, index) => <KlassCard key={index} klass={klass} />)
                }
            </Grid.Column>

            <Grid.Column style={{ height: "100%", overflow: "scroll" }} width={12}>
                {
                    R.isEmpty(ruleIds)
                        ? <p>No classes were loaded.</p>
                        : ruleIds.map(id => <RuleCard key={id} id={id} />)
                }
                <Form>
                    <Form.Field>
                        <Button icon="add" color="blue" content="Add rule" onClick={addRule} />
                    </Form.Field>
                </Form>
            </Grid.Column>
        </Grid >
    );
};
