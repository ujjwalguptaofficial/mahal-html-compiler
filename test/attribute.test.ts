import { expect } from "chai";
import { createRenderer } from "../src/index";
import { createComponent } from "./create_component";
import { mount } from "@mahaljs/test-utils";

describe('Attribute', function () {
    it('with simple ', () => {
        createRenderer(`
        <div :name='ujjwal'></div>
        `)
    })

    it('with empty attribute ', () => {
        createRenderer(`
        <div name=''></div>
        `)
    })

    it('with special char in expression attribute ', () => {
        createRenderer(`
        <div :name="'1234567890p rofile1_~!@#$%^&*()-_=+{}[]:;.jpg|\<,>.?/' | imgPath"></div>
        `)
    })

    it('with special char in attribute ', () => {
        createRenderer(`
        <div name="1234567890p rofile1_~!@#$%^&*()-_=+{}[]:;.jpg|\<,>.?/"></div>
        `)
    })

    it('without attribute value', () => {
        createRenderer(`
        <div name></div>
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

    it('with scoped', async () => {
        const compClass = createComponent(`
        <button>Update</button>
`, 'dd');

        const component = await mount(compClass);

        const btn = component.element;
        expect(btn.textContent).equal('Update');
        expect(btn.hasAttribute('mahal-dd')).equal(true);
        // expect(val.toString()).equal(`function anonymous(renderer\n) {\nconst ctx = this;\nconst ce = renderer.createElement;\nconst ct = renderer.createTextNode;\nconst f = renderer.format;\nconst he = renderer.runExp;\nreturn ce(\'button\', [ct(\'Update\')], {\n    attr: {\n        \'mahal-dd\': {\n            v: \'\'\n        }\n    }\n})\n}`)
    })

    it('with scoped having some attributes', async () => {
        const compClass = createComponent(`
        <button class='gg' name='ujjwal'>Update</button>
`, 'dd');

        const component = await mount(compClass);

        const btn = component.element;
        expect(btn.textContent).equal('Update');
        expect(btn.hasAttribute('mahal-dd')).equal(true);
        expect(btn.getAttribute('class')).equal('gg');
        expect(btn.getAttribute('name')).equal('ujjwal');
    })

    it('element with "-" in attribute', async () => {
        const html = `<span class-name="navbar-toggler-icon"></span>`;

        const compClass = createComponent(`
        ${html}
             `)

        const component = await mount(compClass);
        const btn = component.element;
        expect(btn.tagName).equal('SPAN')
        expect(btn.getAttribute('class-name')).equal('navbar-toggler-icon')
    })

    it('element with "-" in expression attribute', async () => {
        const html = `<span :class-name="name"></span>`;

        const compClass = createComponent(`
        ${html}
             `)

        const component = await mount(compClass);
        const btn = component.element;
        expect(btn.tagName).equal('SPAN')
        expect(btn.getAttribute('class-name')).equal('ujjwal gupta')
    })

    it('diff char in attribute', async () => {
        const html = `<div target="_blank@" class="my-auto" style="width: 100%;"></div>`

        const compClass = createComponent(`
    ${html}
         `)

        const component = await mount(compClass);
        const btn = component.element;
        expect(btn.tagName).equal('DIV')
    })

    it('array with prop using for', async () => {
        const html = `<div><div class="fruit" :for(item in fruits) :fruit="item">{{item}}</div></div>`

        const compClass = createComponent(`
    ${html}
         `)

        const component = await mount(compClass);
        const fruits = component.element.querySelectorAll('.fruit')
        component.getState('fruits').forEach((fruit, index) => {
            expect(fruit).equal(fruits[index].innerHTML);
            expect(fruit).equal(fruits[index].getAttribute('fruit'));
        })
    })

    it('array with prop using for self closing', async () => {
        const html = `<div><div class="fruit" :for(item in fruits) :fruit="item"/></div>`

        const compClass = createComponent(`
    ${html}
         `)

        const component = await mount(compClass);
        const fruits = component.element.querySelectorAll('.fruit')
        component.getState('fruits').forEach((fruit, index) => {
            expect(fruit).equal(fruits[index].getAttribute('fruit'));
        })
    })
})