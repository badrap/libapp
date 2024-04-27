# libapp [![tests](https://github.com/badrap/libapp/workflows/tests/badge.svg)](https://github.com/badrap/libapp/actions?query=workflow%3Atests)

TypeScript helpers for creating Badrap apps.

## Installation

```
npm i @badrap/libapp
```

## Enabling JSX/TSX support

To enable JSX/TSX support for your whole codebase, modify your **tsconfig.json** file by adding in the following lines:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@badrap/libapp"
  }
}
```

To enable JSX/TSX support for just one specific file, add the following pragma comment to the beginning of that file:

```ts
/* @jsxImportSource @badrap/libapp */
```

## License

This library is licensed under the MIT license. See [./LICENSE].
