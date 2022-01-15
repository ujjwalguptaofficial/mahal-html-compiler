import { createRenderer } from "../src/index";

describe('Comment', function () {
    it('with simple ', () => {
        createRenderer(`
        <!-- <ss>dftg@12345</ss> -->
        `)
    })

    it('with single - ', () => {
        createRenderer(`
        <!-- <ss>ffff-ff</ss> -->
        `)
    })

    it('with multiple - ', () => {
        createRenderer(`
        <!-- <ss>ffff---ff</ss> -->
        `)
    })

    it('with nested html tag ', () => {
        createRenderer(`
        <div>
        <!-- <ss>dftg@12345</ss> -->
        Hi
        </div>
        `)
    })

})