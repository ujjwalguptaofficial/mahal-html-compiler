const { createRenderer } = require("@mahaljs/html-compiler");

try {
	var fn = createRenderer(`
	<div><div :for(fruit in fruits) >{{fruit.id}}</div></div>
`);

	console.log(fn.toString());
} catch (error) {
	console.error(error);
}

// function temp() {
// 	const ctx = this;
// 	const ce = renderer.createElement;
// 	const ct = renderer.createTextNode;
// 	const f = renderer.format;
// 	const he = renderer.runExp;
// 	return ce('div', [ce('h1', [ct(' Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.\t')],{ attr:{'mahal - dd':{v:''}}})],{ attr:{'mahal - dd':{v:''}}})
// }
