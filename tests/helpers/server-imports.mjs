// Node 26 strips TypeScript; resolve the app's emitted .js imports back to .ts.
// The Cloudflare env shim is test-only. Every route test supplies a local DB.
import { existsSync } from "node:fs";
import { registerHooks } from "node:module";

const sourceRoot = new URL("../../src/", import.meta.url);
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "cloudflare:workers") {
      return { url: "data:text/javascript,export const env = {};", shortCircuit: true };
    }
    if (specifier.startsWith("#lib/")) {
      specifier = new URL(specifier.slice(1).replace(/\.js$/, ".ts"), sourceRoot).href;
    } else if (
      context.parentURL?.startsWith(sourceRoot.href) &&
      specifier.startsWith(".") &&
      specifier.endsWith(".js")
    ) {
      const source = new URL(specifier.replace(/\.js$/, ".ts"), context.parentURL);
      if (existsSync(source)) specifier = source.href;
    }
    return nextResolve(specifier, context);
  },
});
