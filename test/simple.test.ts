import { createRenderer } from "../src/index";
import { expect } from "chai";


describe('simple', function () {
    it('div with mustache expression', () => {
        createRenderer(`<div>{{ujjwal}}</div>`)
    })

    it('div with simple inner text', () => {
        createRenderer(`<div>ujjwal</div>`)
    })

    it('div with unclosed tag', () => {
        try {
            createRenderer(`<div>`);
        } catch (error) {
            expect(error.message).to.be.equal(`Expected <, close tag, html, or mustache expression but end of input found.`)
        }
        // new Promise(() => {
        //     createRenderer(`<div>`)
        // }).then(done).catch(() => {
        //     done();
        // });
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

    it('tag with "-"', () => {
        createRenderer(`<div>
        <in-place of="name" />
     </div>`);
    })

    it('numbers inside html tag', () => {
        createRenderer(`<div>
        1234
     </div>`);
    })

    it('@ inside html tag', () => {
        createRenderer(`<div>
        @
     </div>`);
    })

    it('h1tag', () => {
        createRenderer(`<div>
        <h1>Title</h1>
     </div>`);
    })


})