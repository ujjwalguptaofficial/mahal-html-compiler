import { createRenderer } from "../src/index";

describe('simple', function () {
    it('div with mustache expression', () => {
        createRenderer(`<div>{{ujjwal}}</div>`)
    })

    it('div with simple inner text', () => {
        createRenderer(`<div>ujjwal</div>`)
    })

    it('div with unclosed tag', (done) => {
        new Promise(() => {
            createRenderer(`<div>`)
        }).catch(() => {
            done();
        });
    })

    it('div with self closing tag', () => {
        createRenderer(`<div/>`);
    })

    it('multiple parent', (done) => {
        new Promise(() => {
            createRenderer(`<div></div><div></div>`);

        }).catch(() => {
            done();
        });
    })

    it('multiline', () => {
        createRenderer(`<div>
          <div>Ujjwal</div>
        </div>`);
    })

    it('bind value', () => {
        createRenderer(`<div>
        Standard Text box
           <input type="text" :value="value" on:input="onInput" />
        </div>`);
    })

    it('model', () => {
        createRenderer(`<div>
        <input type="text" #model(text) />
     </div>`);
    })

    
})