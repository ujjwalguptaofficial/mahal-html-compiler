import { createRenderer } from "../src/index";

describe('simple', function () {
    it('div with mustache expression', () => {
        createRenderer(`<div>{{ujjwal}}</div>`)
    })
})