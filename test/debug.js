const { createRenderer } = require("mahal-html-compiler");

var fn = createRenderer(`
            <button on:click="{update(editStudent)}">Update</button>
`);

console.log(fn.toString());