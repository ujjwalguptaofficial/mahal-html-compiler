import { IExpression } from "../add_ctx_to_expression";
export interface IIfExpModified {
    ifExp: IExpression;
    ifElseList: ICompiledView[];
    else: ICompiledView;
}

export interface IForExp {
    key: string;
    value: IExpression;
    index: string;
}
export interface ICompiledView {
    view: {
        tag: string,
        ifExpModified?: IIfExpModified,
        ifExp?: {
            ifCond: IExpression;
            elseIfCond: IExpression;
            else: boolean;
        },
        forExp?: IForExp,
        attr: {
            key: string,
            value: string | IExpression,
            isExpression: Boolean,
            filters: string[]
        }[],
        model?: string,
        events: {
            name: string;
            handlers: string[];
            option: object,
            isNative: boolean,
            modifiers: string[]
        }[],
        dir?: {
            [name: string]: IExpression[]
        }
    },
    mustacheExp?: IExpression,
    child: ICompiledView[]
    filters?: string[];
    localVars?: {
        [key: string]: string[]
    };
}