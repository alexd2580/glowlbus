import * as esbuild from "esbuild";
import { esbuildOptions } from "./esbuild_options.mjs";

await esbuild.build({
  ...esbuildOptions(false),
  minify: true,
});
