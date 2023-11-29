declare function loadPyodide(): Promise<Pyodide>;

type PyValue = any;

interface Scope {
  [key: string]: PyValue;
}

interface Variables {
  locals?: Scope;
  flobals?: Scope;
}

interface Pyodide {
  loadPackage(code: string): Promise<void>;
  pyimport(code: string): any;
  toPy<T>(t: T): PyValue;
  runPython(code: string): PyValue;
  runPython(code: string, variables: Variables): PyValue;
}

export async function setupPython(): Promise<Pyodide> {
  const pyodide = await loadPyodide();
  await pyodide.loadPackage("micropip");
  const micropip = pyodide.pyimport("micropip");
  await micropip.install("sqlite3");
  await micropip.install("static/Owlready2-0.25-py3-none-any.whl");
  const code = await (await fetch("static/index.py")).text();
  pyodide.runPython(code);
  return pyodide;
}

export let pyodideLoader: Promise<Pyodide> = setupPython();

setupPython();

type FunctionCallString = `${string}(${string})`;

export async function runPython(code: FunctionCallString, context: { [key: string]: any }): Promise<any> {
  const pyodide = await pyodideLoader;
  const locals = pyodide?.toPy(context);
  return pyodide?.runPython(code, { locals }).toJs();
}
