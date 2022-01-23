const { createRenderer } = require("mahal-html-compiler");

try {
    var fn = createRenderer(`
            <button :class='gg' :name='name | upper'>Update</button>
`);

    console.log(fn.toString());
} catch (error) {
    console.error(error);
}
