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
})