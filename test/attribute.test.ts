import { expect } from "chai";
import { createRenderer } from "../src/index";

describe('Comment', function () {
    it('with simple ', () => {
        createRenderer(`
        <div :name='ujjwal'></div>
        `)
    })

    it('with filter ', () => {
        createRenderer(`
        <div :name='ujjwal | upper'></div>
        `)
    })

    it('with filter & space in end', () => {
        createRenderer(`
        <div :name='ujjwal | upper '></div>
        `)
    })

    it('with scoped', () => {
        const val = createRenderer(`
        <button>Update</button>
`, 'dd');

        expect(val.toString()).equal(`function anonymous(renderer\n) {\nconst ctx = this;\nconst ce = renderer.createElement;\nconst ct = renderer.createTextNode;\nconst f = renderer.format;\nconst he = renderer.runExp;\nreturn ce(\'button\', [ct(\'Update\')], {\n    attr: {\n        \'mahal-dd\': {\n            v: \'\'\n        }\n    }\n})\n}`)
    })

    it('with scoped having some attributes', () => {
        createRenderer(`
        <button :class='gg' :name='name | upper'>Update</button>
`, 'dd');
    })
})