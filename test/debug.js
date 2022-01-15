const { createRenderer } = require("mahal-html-compiler");

try {
    var fn = createRenderer(`
            <button on:click="{update(editStudent)}">Update</butdton>
`);

    console.log(fn.toString());
} catch (error) {
    console.error(error);
}
