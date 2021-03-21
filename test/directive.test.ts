import { createRenderer } from "../src/index";
console.log("env", process.env.NODE_ENV);

describe('Directive', function () {
    it('example 1', () => {
        createRenderer(`
        <div>
  <div id="el1" #name('ujjwal') #fu>Hey</div>
  <div id="el2" #name(name)>Hey</div>
  <div id="el3" #name>Hey</div>
  <div id="el4" #highlight>Hey</div>
  <div id="el5" #highlight('grey')>Hey</div>
  <div id="el6" #highlight('blue','red')>Hey</div>
  <div #if(el7) id="el7" #highlight(backgroundColor , 'yellow')>Hey</div>
  <div  id="el8" #highlight(backgroundColor , color )>Hey</div>
</div>
        `)
    })

    it('example 2', () => {
        createRenderer(`
        <div>
        <div class="row">
            <div #addClass({ 'active' : value===tab }) on:click="()=>{onTabClick(tab)}" class="tab margin-right-10px" #for(tab in tabs) >
                {{tab}}
            </div>
        </div>  
</div>
        `)
    })

})