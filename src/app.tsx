import * as React from "react";
import { Button, Card, CardProps, Container, Form, Grid, Icon, Menu, Message } from "semantic-ui-react";
import * as R from "ramda";

import { fileDialog } from "./models/file-dialog";
import { owlFile } from "./models/owl-file";

import { LoadingOverlay } from "./components/loading-overlay";
import { KlassCard } from "./components/klass-card";
import { RuleCard } from "./components/rule-card";
import { LoadFileButton } from "./components/load-file-button";
import { SaveFileAsButton } from "./components/save-file-as-button";

import { useObservable } from "./utils/use-observable";
import { useEffect, useRef } from "react";

export const App = () => {
    const dialogVisible = useObservable(fileDialog.visible);
    const path = useObservable(owlFile.path);
    const [error, showError] = useObservable(owlFile.displayError);

    const errorMessageStyle: React.CSSProperties = {
        transition: "opacity 0.5s ease, right 0.5s ease",
        position: "absolute",
        top: "10px",
        right: showError ? "10px" : "0px",
        opacity: showError ? 1 : 0,
    };

    return (
        <>
            <Menu attached='top' inverted>
                <Container>
                    <Menu.Item><Icon name="globe" size="big" /><big>GlOWLbus</big></Menu.Item>
                    <Menu.Item><LoadFileButton /></Menu.Item>
                    <Menu.Item><SaveFileAsButton /></Menu.Item>
                </Container>
            </Menu>
            <LoadingOverlay active={dialogVisible} style={{ backgroundColor: "#A5D8DD", padding: 0, margin: 0, height: "calc(100% - 54px)" }}>
                <Container fluid style={{ width: "90%", height: "100%", backgroundColor: "transparent" }}>
                    {typeof path === "undefined" ? <LoadFile /> : <EditFile />}
                    <div style={errorMessageStyle}>
                        <Message size="big" negative icon="save" header="Error" content={error} />
                    </div>
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
    const ref = useRef(null);
    const klassIndices = Object.fromEntries(klassIds.map((id, index) => [id, index]));

    useEffect(() => {
        const subscription = owlFile.hoveredKlass().subscribe((hovered) => {
            const hoveredIndex = hovered && klassIndices[hovered];
            const klasses = (ref.current as HTMLDivElement | null)?.children;
            hoveredIndex && klasses?.[hoveredIndex].scrollIntoView({ behavior: "smooth", block: "center" });
        });
        return () => subscription.unsubscribe();
    }, [ref, JSON.stringify(klassIndices)]);

    const ruleIds = useObservable(owlFile.rules.keys());
    return (
        <Grid columns={2} style={{ margin: 0, height: "100%" }}>
            <Grid.Column style={{ height: "100%", overflow: "scroll" }} width={5}>
                <div ref={ref}>
                    {
                        R.isEmpty(klassIds)
                            ? <p>No classes loaded.</p>
                            : klassIds.map(id => <KlassCard key={id} id={id} />)
                    }
                </div>
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
