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
        <input :model(email) type="text" />
        <button id="btnSubmit" on:click={"validate" | "submit"}>Submit</button>
        </div>
        `)
    })

    it('example 1', () => {
        createRenderer(`
        <div>
        <div>{{counter}}</div>
        <div>
                <button on:click="increment">Increment</button>
        </div>
   </div>
        `)
    })

    it('example 2', () => {
        createRenderer(`
        <div>
        <div :for(fruit,i in fruits)>
                <input type="text" :model(fruit) />
                <span on:click="()=>{updateFruit(fruit.name,i)}">{{fruit}}</span>
                <button on:click="()=>{updateFruit(fruit,i)}">Update</button>
            </div>
        </div>
        `)
    })

    it('example 3', () => {
        createRenderer(`
        <button on:click="{update(editStudent)}">Update</button>
        `)
    })
})