import { expect } from "chai";
import { createRenderer } from "../src/index";
import { createComponent } from "./create_component";
import { mount } from "mahal-test-utils";
import { Component } from "mahal";

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

//     it('with scoped', async () => {
//         const compClass = createComponent(`
//         <button>Update</button>
// `, 'dd');

//         const component = await mount(compClass);

//         const btn = component.find('button')
//         expect(btn.textContent).equal('Update');
//         // expect(val.toString()).equal(`function anonymous(renderer\n) {\nconst ctx = this;\nconst ce = renderer.createElement;\nconst ct = renderer.createTextNode;\nconst f = renderer.format;\nconst he = renderer.runExp;\nreturn ce(\'button\', [ct(\'Update\')], {\n    attr: {\n        \'mahal-dd\': {\n            v: \'\'\n        }\n    }\n})\n}`)
//     })

    it('with scoped having some attributes', () => {
        createRenderer(`
        <button :class='gg' :name='name | upper'>Update</button>
`, 'dd');
    })

    it('with scoped with big text', () => {
        createRenderer(`
        <div>
	<h1>
		Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's
		standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make
		a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting,
		remaining essentially unchanged.
	</h1>
</div>
        `)
    })

    it('with scoped with big text and scoped', () => {
        createRenderer(`
        <div>
	<h1>
		Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's
		standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make
		a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting,
		remaining essentially unchanged.
	</h1>
</div>
        `)
    })
})