const { createRenderer } = require("mahal-html-compiler");

var fn = createRenderer(`<div>
<div #for(fruit,i in fruits)>
        <input type="text" #model(fruit) />
        <span>{{fruit}}</span>
        <button on:click="()=>{updateFruit(fruit,i)}">Update</button>
    </div>
</div>`);

console.log(fn.toString());