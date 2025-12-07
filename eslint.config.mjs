import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import { globalIgnores } from "eslint/config";

export default defineConfig(
  globalIgnores(["dist/"]),
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ["eslint.config.mjs"],
        },
      },
    },
    rules: {
      eqeqeq: ["error", "smart"],
      "linebreak-style": ["error", "unix"],
      "no-console": "error",
      "no-multi-assign": "error",
      "no-return-assign": "error",
      "no-unused-expressions": "error",
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        {
          allowAny: false,
          allowBoolean: false,
          allowNullish: false,
          allowNumber: true,
          allowRegExp: false,
        },
      ],
      "@typescript-eslint/explicit-member-accessibility": [
        "error",
        { accessibility: "no-public" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/no-namespace": ["error", { allowDeclarations: true }],

      // Ensure that type-only imports can be elided when Node.js's
      // type stripping is used enabled and/or tsconfig enables
      // "verbatimModuleSyntax".
      //
      // The consistent-type-imports and consistent-type-exports rules
      // require type-only imports and export to be explicit.
      //
      // The no-import-type-side-effects rule disallows imports like
      // `import { type A } from "a"` that may get transpiled into empty
      // imports like `import {} from "a"`. If such an empty import is
      // actually needed (for its side-effects) then declare it explicitly
      // with `import "a"`.
      "@typescript-eslint/consistent-type-exports": [
        "error",
        { fixMixedExportsWithInlineTypeSpecifier: true },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-import-type-side-effects": "error",
    },
  },
);
