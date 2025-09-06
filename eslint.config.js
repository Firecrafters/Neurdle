import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";

export default [
    js.configs.recommended,
    {
        files: [ "src/**/*.{ts,tsx,mts,cts}", "src/**/types.d.ts" ],
        plugins: {
            "@typescript-eslint": tseslint
        },
        languageOptions: {
            parser: tsparser,
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: "module",
                project: "./tsconfig.json"
            },
            globals: {
                // Node.js globals
                console: "readonly",
                process: "readonly",
                // Browser globals
                window: "readonly",
                document: "readonly",
                localStorage: "readonly",
                sessionStorage: "readonly",
                navigator: "readonly",
                location: "readonly",
                setTimeout: "readonly",
                clearTimeout: "readonly",
                setInterval: "readonly",
                clearInterval: "readonly"
            }
        },
        rules: {
            ...tseslint.configs.recommended.rules,
            "@typescript-eslint/no-unused-vars": "error"
        }
    },
    {
        ignores: [ "node_modules/", "**/*.d.ts", "!**/types.d.ts", "**/*.js" ]
    }
]

