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
}

type PyValue = any;

interface Scope {
    [key: string]: PyValue;
}

interface Variables {
    locals?: Scope;
    flobals?: Scope;
}

interface Pyodide {
    toPy<T>(t: T): PyValue;
    runPython(code: string, variables: Variables): PyValue;
}

interface Pyscript {
    interpreter: {
        interpreter: Pyodide;
    }
}

declare global {
    interface Window {
        electron: Electron;
        pyscript: Pyscript;
    }
}

const node = document.getElementById("root");
if (node !== null) {
    createRoot(node).render(<App />);
}
