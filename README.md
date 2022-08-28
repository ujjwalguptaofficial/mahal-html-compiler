[![TEST](https://github.com/ujjwalguptaofficial/mahal-html-compiler/actions/workflows/test.yml/badge.svg)](https://github.com/ujjwalguptaofficial/mahal-html-compiler/actions/workflows/test.yml)
[![npm version](https://badge.fury.io/js/@mahaljs%2Fhtml-compiler.svg)](https://badge.fury.io/js/@mahaljs%2Fhtml-compiler)


# mahal-html-compiler

official Html compiler for [mahal framework](https://github.com/ujjwalguptaofficial/mahal)

# Install

```
npm i @mahaljs/html-compiler
```

# Doc
  
mahal-html-compiler exposes `createRenderer` method which takes html string as input and convert it to a method which is used by mahal.js to create the html element.

```
import { createRenderer } from "@mahaljs/html-compiler";
const method = createRenderer(`<div>{{ujjwal}}</div>`);
```
