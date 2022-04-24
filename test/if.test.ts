import { createRenderer } from "../src/index";
import { expect } from "chai";

describe('If', function () {

    it('if simple', () => {
        createRenderer(`<div :if(name)>Click me</div>`)
    })

    it('if with on event', () => {
        createRenderer(`<div :if(name) on:click="handleClick">Click me</div>`)
    })

    it('multiple if', () => {
        createRenderer(`<div>
        <div :if(cond1)></div>
        <div :if(cond2)></div>
        </div>
        `)
    })

    it('if else', () => {
        try {
            createRenderer(`
            <div :if(cond1)></div>
            <div :else ></div>
            `)
        } catch (error) {
            expect(error.message).to.be.equal(`Expected end of input but "\\n" found.`)
        }

    })

    it('if & else if', () => {
        createRenderer(`<div>
        <div :if(cond1)></div>
        <div :else-if(cond2)></div>
        </div>
        `)
    })

    it('if else if else', () => {
        createRenderer(`<div>
        <div :if(cond1)></div>
        <div :else-if(cond2)></div>
        <div :else-if(cond3)></div>
        <div :else-if(cond4)></div>
        <div :else></div>
        </div>
        `)
    })

    it('complex example1', () => {
        createRenderer(`<div :stateAttr="state" :addClass({'state-0':state===0,'state-1':state===1,'state-gt-10':state>10,'nested-3':nested.nested1.nested2.nested3==0})>
        <div :addClass('state--0','state--01') :if(state==0)>0th{{state}}</div>
        <div :else-if(state==1)>1st{{state}}</div>
        <div :else-if(state===2)>{{state | dollar}}</div>
        <Btn :else-if(state<=3) label='ok'></Btn>
        <Btn :else-if(state>=4 && state<anotherState) label='Hello'></Btn>
        <Btn :else-if(state===nested.nested1.nested2.nested3) label='10'></Btn>
        <div :else>{{state}}</div>
     </div>
        `)
    })

    it('if with !', () => {
        createRenderer(`<div>
        <div :if(!cond1)></div>
        <div :else-if(!'cond2')></div>
        </div>
        `)
    })

    it('if with >', () => {
        createRenderer(`<div>
        <div :if(item.length > 0)></div>
        <div :if(item.length == 0)></div>
        <div :if(item.length != 0)></div>
        <div :if(item.length <= 0)></div>
        <div :if(item.length >= 0)></div>
        <div :else-if(!item.length < 0)></div>
        </div>
        `)
    })

    it('if with array prop', () => {
        createRenderer(`<div>
        <div :if(item[0])></div>
        <div :if(item['a']['b'])></div>
        <div :if(item[0][1] == 0)></div>
        <div :if(item['a'] != 0)></div>
        <div :if(item['b']['c'] <= 0)></div>
        <div :if(item[0]['a'] >= 0)></div>
        <div :else-if(!item['a'] < 0)></div>
        </div>
        `)
    })

    it('if with array prop with component prop', () => {
        try {
            createRenderer(`<div>
        <div :if(item[a])></div>
        </div>
        `)
            throw new Error('should have been error')
        } catch (error) {
            expect(error.message).equal('Component prop are not supported in html, please use Computed.')
        }
    })
})