import { Component } from "mahal";
import { createRenderer } from "mahal-html-compiler";

export function createComponent(template: string, scoped?) {
    const result = createRenderer(template, scoped);

    class MyComponent extends Component {
        render = result as any;

        name = 'ujjwal gupta'
        fruits = ['apple', 'mango']
        students = [{
            id: 1,
            name: 'd'
        }]

        logText(data) {
            console.log(data);
        }
    }

    return MyComponent;

}