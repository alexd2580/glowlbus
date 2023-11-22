import { htmlPlugin } from "@craftamap/esbuild-plugin-html";
import { typecheckPlugin } from "@jgoz/esbuild-plugin-typecheck";

export const esbuildOptions = {
  bundle: true,
  sourcemap: true,
  allowOverwrite: true,
  outdir: "dist",

  // The typescript file references the css file as dependency.
  entryPoints: ["src/index.tsx", "static/index.py", "static/Owlready2-0.25-py3-none-any.whl"],

  // `esbuild-plugin-html` needs this.
  metafile: true,

  // This is needed for SPA support (it links the .js and .css file by absolute path).
  // publicPath: "/",

  plugins: [
    htmlPlugin({
      files: [
        {
          filename: "index.html",
          htmlTemplate: "static/index.html",
          entryPoints: ["src/index.tsx"],
          findRelatedCssFiles: true,
          findRelatedOutputFiles: true
        }
      ]
    }),
    // Otherwise, TS is not checked.
    typecheckPlugin()
  ],
  loader: {
    // We host a built wheel of owlready.
    ".whl": "copy",
    // As well as the python code.
    ".py": "copy",
    // The following are semantic UI things.
    '.png': 'dataurl',
    '.woff': 'dataurl',
    '.woff2': 'dataurl',
    '.eot': 'dataurl',
    '.ttf': 'dataurl',
    '.svg': 'dataurl',
  },
  logLevel: "debug",
};
