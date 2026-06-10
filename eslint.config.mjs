import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vendored/static assets (o.a. de draco-decoder) niet linten:
    "public/**",
  ]),
  {
    rules: {
      // Bewust kale <img> op de meeste plekken: de WebGL-pipeline
      // (useWebGLEffects) leest img.src in als Three.js-texture en
      // verbergt het element zelf — next/image's srcset/lazy-gedrag
      // breekt die pipeline. Waar geen WebGL op zit (homepage-hero)
      // gebruiken we wél next/image.
      "@next/next/no-img-element": "off",
    },
  },
]);

export default eslintConfig;
