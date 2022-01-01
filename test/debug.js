const { createRenderer } = require("mahal-html-compiler");

var fn = createRenderer(`<div>
<div #for(fruit in fruits)>
    <input type="text" #model(fruit,f) />
    <span>{{fruit}}</span>
</div>
</div>`);

console.log(fn.toString());