import * as esbuildServer from "esbuild-server";
// import { readFileSync } from "node:fs"
import { esbuildOptions } from "./esbuild_options.mjs";

esbuildServer.createServer({
  ...esbuildOptions,
  minify: false,
}, {
  static: "dist/",
  port: 8001,
  historyApiFallback: true,
  // https: {
  //     key: readFileSync("../cert/localhost.key"),
  //     cert: readFileSync("../cert/localhost.crt"),
  // },
}).start();
