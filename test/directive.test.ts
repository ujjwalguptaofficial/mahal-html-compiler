import { createRenderer } from "../src/index";

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

})