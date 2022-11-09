# libapp [![tests](https://github.com/badrap/libapp/workflows/tests/badge.svg)](https://github.com/badrap/libapp/actions?query=workflow%3Atests)

TypeScript helpers for creating Badrap apps.

## Installation

```
npm i @badrap/libapp
```

## Enabling JSX/TSX support

Modify your tsconfig.json file by adding in the following lines:

```
{
  "compilerOptions": {
    ...
    "jsx": "react-jsx",
    "jsxImportSource": "@badrap/libapp/ui"
  },
  ...
}
```
