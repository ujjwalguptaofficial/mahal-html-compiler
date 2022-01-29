import { Component, Template } from "mahal";
import { } from "mahal-test-utils";
import { IRenderContext } from "mahal/dist/ts/interface";
import { createRenderer } from "mahal-html-compiler";

export function createComponent(template: string, scoped?) {

    class MyComponent extends Component {
        render(context: IRenderContext): Promise<HTMLElement> {
            return createRenderer.call(context, template, scoped);
        }
    }

    return MyComponent;

}