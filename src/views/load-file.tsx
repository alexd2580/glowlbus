import * as React from "react";
import { Button, Card } from "semantic-ui-react";
import { owlFile } from "../models/owl-file";
import { fileDialog } from "../models/file-dialog";
import { ChangeEvent, useRef } from "react";

const LoadFileButton = () => {
    const onClick = async () => {
        const result = await fileDialog.selectViaElectron();
        if (!result) {
            return;
        }
        owlFile.load(result[0], result[1]);
    };

    return <Button basic color='green' icon="file" content="Load OWL" onClick={onClick} />;
};

const LoadFileField = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const onChange = async (event: ChangeEvent) => {
        fileDialog.visible.next(false);

        const files = event.target && (event.target as HTMLInputElement).files;
        if (files && files.length === 1) {
            const file = files[0];
            console.log(file);
            const buffer = await file.arrayBuffer();
            owlFile.load(file.name, buffer);
        }
    };
    const onCancel = () => {
        fileInputRef.current?.removeEventListener("cancel", onCancel);
        fileDialog.visible.next(false);
    };

    const onClick = () => {
        fileDialog.visible.next(true);
        fileInputRef.current?.addEventListener("cancel", onCancel);
        fileInputRef.current?.click();
    }

    return (
        <>
            <Button basic color='green' icon="file" content="Load OWL" onClick={onClick} />
            <input
                ref={fileInputRef}
                type="file"
                accept=".owl"
                hidden
                onChange={onChange}
            />
        </>
    );
};

export const LoadFile = () => {
    const insideElectron = typeof window.electron !== "undefined";

    return (
        <Card>
            <Card.Content>
                <Card.Header>Hello</Card.Header>
                <Card.Description>Now we're running python and semantic ui</Card.Description>

            </Card.Content>
            <Card.Content extra>
                {insideElectron ? <LoadFileButton /> : <LoadFileField />}
            </Card.Content>
        </Card>
    );
};
