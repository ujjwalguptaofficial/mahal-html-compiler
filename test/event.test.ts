import { createRenderer } from "../src/index";

describe('Event', function () {
    it('on:click on div', () => {
        createRenderer(`<div on:click="handleClick">Click me</div>`)
    })

    it('on:click on btn inside div', () => {
        createRenderer(`<div>
            <btn on:click="handleClick">Click me</btn>
        </div>`)
    })

    it('on:click on btn inside div', () => {
        createRenderer(`
    <div>
        <div id="counter">{{counter}}</div>
        <button id="btnIncrement" on:click='increment'>Increment</button>
        <button id="btnDecrement" on:click='decrement'>Decrement</button>
    </div>`)
    })

    it('event with inline handler', () => {
        createRenderer(`
            <button on:click="()=>{students=[]}">Reset</button>
        `)
    })

    it('event chaining', () => {
        createRenderer(`
        <div>
        <input #model(email) type="text" />
        <button id="btnSubmit" on:click={"validate" | "submit"}>Submit</button>
        </div>
        `)
    })
})