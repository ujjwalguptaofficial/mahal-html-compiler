import { createRenderer } from "../src/index";
import { expect } from "chai";


describe('simple', function () {
    it('div with mustache expression', () => {
        createRenderer(`<div>{{ujjwal}}</div>`)
    })

    it('div with mustache expression and space', () => {
        createRenderer(`<div>{{ ujjwal }}</div>`)
    })

    it('div with mustache expression', () => {
        createRenderer(`<div>{{ujjwal + "as" + 1}}</div>`)
    })

    it('div with simple inner text', () => {
        createRenderer(`<div>ujjwal</div>`)
    })

    it('div with unclosed tag', () => {
        try {
            createRenderer(`<div>`);
        } catch (error) {
            expect(error.message).to.be.equal(`Expected <, <!--, close tag, html, or mustache expression but end of input found.`)
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
        <input type="text" :model(text) />
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

    it('a with href as #', () => {
        createRenderer(`<div>
        <a href="#">Title</a>
     </div>`);
    })

    it('| in html', () => {
        createRenderer(`<div>
        <h1>Title | Ujjwal</h1>
     </div>`);
    })

    it('tag with "_"', () => {
        createRenderer(`<div>
        <in_place of="name" />
     </div>`);
    })

    it('html with different closing tag', () => {
        try {
            createRenderer(`<div>dd</divv>`);
            throw new Error('there should be an error')
        } catch (error) {
            console.error("error", error);
            expect(error.message).to.be.equal(`Expected </div> but </divv> found.`)
        }
        // new Promise(() => {
        //     createRenderer(`<div>`)
        // }).then(done).catch(() => {
        //     done();
        // });
    })
})