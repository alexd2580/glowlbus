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

export async function setupPython() {
  pyodide = await loadPyodide();
  await pyodide.loadPackage("micropip");
  const micropip = pyodide.pyimport("micropip");
  await micropip.install("sqlite3");
  await micropip.install("static/Owlready2-0.25-py3-none-any.whl");
  const code = await (await fetch("static/index.py")).text();
  pyodide.runPython(code);
}

export let pyodide: Pyodide | undefined = undefined;

setupPython();

type FunctionCallString = `${string}(${string})`;

export function runPython(code: FunctionCallString, context: { [key: string]: any }): any {
  // TODO wait for pyodide? Lazy loading? defer loading?
  const locals = pyodide?.toPy(context);
  return pyodide?.runPython(code, { locals }).toJs();
}
