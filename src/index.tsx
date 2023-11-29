import * as React from "react";
import { createRoot } from "react-dom/client";

import 'semantic-ui-css/semantic.min.css'

import { App } from "./app";

interface FileFilter {
    name: string;
    extensions: string[];
}

interface Electron {
    loadFile(filters: FileFilter[]): Promise<[filePath: string, data: Buffer] | undefined>;
    saveFile(path: string, data: Buffer): Promise<void>;
}

declare global {
    interface Window {
        electron: Electron;
    }
}

const node = document.getElementById("root");
if (node !== null) {
    createRoot(node).render(<App />);
}
