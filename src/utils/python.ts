type FunctionCallString = `${string}(${string})`;

export function runPython(code: FunctionCallString, context: { [key: string]: any }): any {
    const pyodide = window.pyscript.interpreter.interpreter;
    const locals = pyodide.toPy(context);
    return pyodide.runPython(code, { locals }).toJs();
}
