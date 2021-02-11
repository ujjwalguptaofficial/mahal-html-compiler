import { createRenderer } from "../src/index";

describe('Filter', function () {
    it('single', () => {
        createRenderer(`
        <div>
        {{name | toUpper}}
        </div>
        `)
    })

    it('multiple filter', () => {
        createRenderer(`
        <div>
        {{name | toUpper | toLower | symbol}}
        </div>
        `)
    })

    it('filter on string', () => {
        createRenderer(`
        <div>
        {{'name' | toUpper | toLower | symbol}}
        </div>
        `)
    })

    it('filter stick to |', () => {
        createRenderer(`
        <div>
        {{name |toUpper }}
        </div>
        `)
    })

})