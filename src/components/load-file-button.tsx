import * as React from "react";
import { ChangeEvent, useRef } from "react";
import { Button } from "semantic-ui-react";

import { owlFile } from "../models/owl-file";
import { fileDialog } from "../models/file-dialog";

const LoadFileElectron = () => {
    const onClick = async () => {
        const result = await fileDialog.selectViaElectron();
        if (!result) {
            return;
        }
        owlFile.importFromSerialized(result[0], result[1]);
    };

    return <Button basic color='green' icon="file" content="Load OWL" onClick={onClick} />;
};

const LoadFileHtml = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const onChange = async (event: ChangeEvent) => {
        fileDialog.visible.next(false);

        const files = event.target && (event.target as HTMLInputElement).files;
        if (files && files.length === 1) {
            const file = files[0];
            const buffer = await file.arrayBuffer();
            console.log(file);
            owlFile.importFromSerialized(file.name, buffer);
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

export const LoadFileButton = () => typeof window.electron !== "undefined" ? <LoadFileElectron /> : <LoadFileHtml />;
