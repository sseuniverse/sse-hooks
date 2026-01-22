import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: ["./src/index"],
  clean: true,
  declaration: true,
  outDir: "./dist",
  externals: ["react", "react-dom", "react/jsx-runtime"],
  // failOnWarn: false,

  rollup: {
    emitCJS: true,
    esbuild: {
      jsx: "automatic",
    },
  },

  hooks: {
    "rollup:options"(ctx, options) {
      if (Array.isArray(options.output)) {
        options.output.forEach((o) => {
          o.banner = (chunk) => {
            if (chunk.isEntry && chunk.facadeModuleId?.includes("useClient")) {
              return "'use client';";
            }
            return "";
          };
        });
      }
    },
  },
});
