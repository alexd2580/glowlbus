import * as React from "react";
import { Button, Form, Modal } from "semantic-ui-react";

import { owlFile } from "../models/owl-file";
import { useObservable } from "../utils/use-unwrap";

async function saveFileElectron() {
    const path = owlFile.path.getValue();
    const serialized = owlFile.serialize();

    await window.electron.saveFile(path, serialized);
}

async function saveFileHtml() {
    const path = owlFile.path.getValue();
    const serialized = owlFile.serialize();

    const downloadUrl = URL.createObjectURL(new Blob([serialized.data]));
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = path;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(a);
}

async function saveFile() {
    typeof window.electron !== "undefined"
        ? await saveFileElectron()
        : await saveFileHtml();
}
export const SaveFileAsButton = () => {
    const [open, setOpen] = React.useState(false);
    const path = useObservable(owlFile.path);
    const setFileName = (value: string) => owlFile.path.next(value);

    return (
        <Modal
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
            open={open}
            trigger={<Button>Save OWL as</Button>}
        >
            <Modal.Header>Set file path</Modal.Header>
            <Modal.Content>
                <Modal.Description>
                    <p>We advise saving to a different file name or making a backup.</p>
                    <p><small>Just in case :D</small></p>
                    <Form>
                        <Form.Input
                            placeholder="Save file name..."
                            width={6}
                            value={path}
                            onChange={event => setFileName(event.target.value)}
                        />
                    </Form>
                </Modal.Description>
            </Modal.Content>
            <Modal.Actions>
                <Button color='black' onClick={() => setOpen(false)}>
                    Cancel
                </Button>
                <Button
                    content="Save"
                    labelPosition='right'
                    icon='checkmark'
                    onClick={() => { setOpen(false); saveFile(); }}
                    positive
                />
            </Modal.Actions>
        </Modal>
    );
};
