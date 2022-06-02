import { parseview } from "./parse_view";
import { LogHelper } from "./utils";
import { ERROR_TYPE } from "./enums";
import { CONTEXT_STRING } from "./constant";
import { ICompiledView, IIfExpModified } from "./interface";
import { removeCommaFromLast } from "./remove_comma_from_last";
import { convertArrayToString, createSetterForDirective } from "./convert_array_to_comma_seperated_string";
import beautify from 'js-beautify';
import { IExpression } from "./add_ctx_to_expression";
import { EOL } from "os";
import { handleLocalVar } from "./handle_local_var";

const CTX = CONTEXT_STRING;

export function createRenderer(template: string, moduleId?: string) {
    template = template.trim();
    let compiledParent: ICompiledView;
    if (process.env.NODE_ENV == "test") {
        compiledParent = parseview(template);
    }
    else {
        try {
            compiledParent = parseview(template);
        } catch (ex) {
            // let string = `console.error(${JSON.stringify(ex.message)});`;
            // string += "const template=`" + JSON.stringify(template) + "`;"
            // string += `const location=${JSON.stringify(ex.location)};`;
            // string += `const css = 'background: #28334AFF; color: #FBDE44FF; font-size:16px;';`;
            // string += `const lines = template.split("\\n");`
            // string += ` console.log("%c" + lines.slice(0, location.start.line - 1).join("\\n") +
            // "%c" + lines.slice(location.start.line - 1, location.end.line).join("\\n") +
            // "%c" + lines.slice(location.end.line).join("\\n")
            // , css, css + ';color:#F65058FF', css);`;
            // string += `return Promise.resolve(document.createComment(null));`
            // return new Function(string);
            const location = ex.location;
            const lines = template.split(EOL);
            compiledParent = {
                view: {
                    tag: "p",
                    attr: [{
                        key: 'style',
                        value: 'background: #28334AFF; color: #FBDE44FF; font-size:16px; position:fixed;width:100%;max-height:100%;overflow-y:auto;top:0;left:0;padding:20px;z-index:100000000000000000000000;',
                        isExpression: false,
                        filters: [],
                    }],
                    events: [],
                },
                child: [
                    {
                        view: {
                            tag: "p",
                            attr: [{
                                key: 'style',
                                value: 'color:#F65058FF; margin:20px 0; border:1px solid;padding:15px;',
                                isExpression: false,
                                filters: [],
                            }],
                            events: []
                        },
                        child: [
                            ex.message
                        ],
                    },
                    lines.slice(0, location.start.line - 1).join("\\n") as any,
                    {
                        view: {
                            tag: "p",
                            attr: [{
                                key: 'style',
                                value: 'color:#F65058FF',
                                isExpression: false,
                                filters: [],
                            }],
                            events: []
                        },
                        child: [
                            lines.slice(location.start.line - 1, location.end.line).join("\\n")
                        ],
                    },
                    lines.slice(location.end.line).join("\\n")
                ],
            }

        }
    }

    // console.log("compiled", compiledParent);
    if (compiledParent.view) {
        if (compiledParent.view.forExp) {
            console.error(`Invalid template ${template}`);
            throw new LogHelper(ERROR_TYPE.ForExpAsRoot).get();
        }
    }
    let parentStr = `const ${CONTEXT_STRING}= this;
    const ce = renderer.createElement;
    const ct = renderer.createTextNode;
    const f = renderer.format;
    const he = renderer.runExp;
    `;
    const createJsEqFromCompiled = (compiled: ICompiledView) => {
        let str = "";
        if (compiled.view) {
            const handleTag = () => {
                const htmlTag = compiled.view.tag;
                let tagHtml = htmlTag == null ? `ce(null,` : `ce('${htmlTag}',`
                if (compiled.child) {
                    let ifModifiedExpression: IIfExpModified;
                    let indexOfIfCond;
                    const indexToRemove = [];
                    let isIfCondEndFound = false;
                    const onIfCondEnd = (last: number) => {
                        if (indexOfIfCond == null) {
                            return;
                        }
                        isIfCondEndFound = true;
                        compiled.child[indexOfIfCond].view.ifExpModified = ifModifiedExpression;
                        ifModifiedExpression = null;
                        // console.log("if cond modified", indexOfIfCond, compiled.child[indexOfIfCond]);
                        for (let i = indexOfIfCond + 1; i < last; i++) {
                            indexToRemove.push(i);
                        }
                        indexOfIfCond = null;
                    }
                    const forExp = compiled.view.forExp;
                    let localVars = compiled.localVars || [];
                    if (forExp) {
                        const forExpkey = forExp.key;
                        const forExpindex = forExp.index;
                        const forValue = forExp.value.raw;
                        localVars.push(forExpkey, `${forExpkey}.`, `${forExpkey}[`, forExpindex, `${forValue}[${forExpindex}]`)
                    }
                    compiled.child.forEach((child, index) => {
                        if (typeof child === 'object') {
                            child.localVars = child.localVars ? child.localVars.concat(localVars) : localVars;
                        }
                        if (!(child.view && child.view.ifExp)) {
                            return onIfCondEnd(index);
                        }
                        const ifExp = child.view.ifExp;
                        if (ifExp.ifCond) {
                            isIfCondEndFound = false;
                            handleLocalVar(compiled.localVars, ifExp.ifCond);
                            ifModifiedExpression = {
                                ifExp: ifExp.ifCond,
                                ifElseList: []
                            } as IIfExpModified;
                            indexOfIfCond = index;
                        }
                        else if (ifExp.elseIfCond) {
                            ifModifiedExpression.ifElseList.push(child);
                        }
                        else if (ifExp.else) {
                            ifModifiedExpression.else = child;
                            onIfCondEnd(index + 1);
                        }
                        else {
                            onIfCondEnd(index);
                        }
                    });

                    // there was no end found and loop has ended
                    if (ifModifiedExpression && isIfCondEndFound === false) {
                        onIfCondEnd(compiled.child.length);
                    }
                    // console.log("indexOfIfCond", indexToRemove);
                    compiled.child = compiled.child.filter((child, index) => {
                        return indexToRemove.indexOf(index) < 0
                    })

                    var child = "["
                    compiled.child.forEach((item, index) => {
                        const childCompiled = createJsEqFromCompiled(item);
                        if (childCompiled && childCompiled.trim().length > 0) {
                            child += `${childCompiled},`;
                        }
                    });
                    child = removeCommaFromLast(child) + "]"
                    tagHtml += child;
                }
                else {
                    tagHtml += "[]";
                }
                return tagHtml;
            }

            const handleOption = () => {
                let optionStr = "{";

                // handle event
                const eventLength = compiled.view.events.length;
                if (eventLength > 0) {
                    let eventStr = "";
                    // const identifierRegex = /([a-zA-Z]+)/g
                    // const identifierRegex = /\b(?!(?:false\b))([\w]+)/g
                    const identifierRegex = /\b(?!(?:false|true\b))([a-zA-Z]+)/g
                    compiled.view.events.forEach((ev, index) => {
                        let handlerStr = "[";
                        ev.handlers.forEach(item => {
                            let replacedStr = item.replace(identifierRegex, `${CTX}.$1`) + ",";
                            const exp = {
                                expStr: replacedStr,
                                keys: [],
                                raw: ''
                            };
                            handleLocalVar(compiled.localVars, exp);
                            handlerStr += exp.expStr;
                        });
                        handlerStr = removeCommaFromLast(handlerStr) + "]";
                        eventStr += `${ev.name}: {
                            handlers: ${handlerStr},
                            isNative: ${ev.isNative},
                            option: ${JSON.stringify(ev.option)},
                            modifiers: ${convertArrayToString(ev.modifiers)}
                        }`

                        if (index + 1 < eventLength) {
                            eventStr += ","
                        }
                    });
                    optionStr += `on:{${eventStr}}`;
                }

                if (compiled.view.dir) {
                    optionStr += `${optionStr.length > 2 ? "," : ''} dir:{`;
                    for (const dirName in compiled.view.dir) {
                        // optionStr += `${dirName}:{ `
                        const dirBinding = {
                            value: [],
                            props: [],
                            params: []
                        }
                        compiled.view.dir[dirName].forEach(dirValue => {
                            // const expressionEvaluation = addCtxToExpression(dirValue);
                            // compiled.localVars.forEach(localVar => {
                            //     if (dirValue.expStr.includes(localVar)) {
                            //         dirValue.expStr = dirValue.raw.replace(CTX + ".", '');
                            //         const indexOfKey = dirValue.keys.findIndex(q => q.includes(localVar));
                            //         dirValue.keys.splice(indexOfKey, 1);
                            //     }
                            // })
                            handleLocalVar(compiled.localVars, dirValue);
                            dirBinding.value.push(dirValue.expStr)
                            dirBinding.props = [...dirBinding.props, ...dirValue.keys]
                            dirBinding.params.push(dirValue.raw)
                        })
                        optionStr += `${dirName}:{ 
                                get value(){ 
                                    return ${convertArrayToString(dirBinding.value, false)} 
                                },
                                set value(values){
                                    ${createSetterForDirective(dirBinding, CTX)}
                                },
                                props:${convertArrayToString(dirBinding.props)},
                                params: ${convertArrayToString(dirBinding.value, false)}
                              },
                            `;

                    }
                    optionStr = removeCommaFromLast(optionStr) + "}";
                    // optionStr += "}"
                }

                // if (compiled.view.html) {
                //     optionStr += `${optionStr.length > 2 ? "," : ''} html:ctx.${compiled.view.html}`;
                // }

                // handle attributes
                const attr = compiled.view.attr;
                // for scoped, add 
                if (moduleId) {
                    attr.push({
                        key: `'mahal-${moduleId}'`,
                        value: '',
                        isExpression: false,
                        filters: []
                    });
                }
                const attrLength = attr.length;
                if (attrLength > 0) {
                    let attrString = '';
                    attr.forEach((item, index) => {
                        if (item.isExpression) {
                            const val: IExpression = item.value as IExpression;
                            handleLocalVar(compiled.localVars, val);
                            const getKey = () => {
                                return val.keys.length > 0 ? `'${val.keys[0]}'` : null
                            }
                            if (item.filters.length > 0) {
                                let method = `()=>{return `;
                                let brackets = "";
                                item.filters.reverse().forEach(item => {
                                    method += `f('${item}',`
                                    brackets += ")"
                                });
                                method += `${val.expStr} ${brackets} }`;
                                attrString += `${item.key}:{v: ${method},k: ${getKey()} , m:true}`;
                            }
                            else {
                                const attributeValue = val.expStr;
                                attrString += `${item.key}:{v: ${attributeValue},k:${getKey()}}`;
                            }
                        }
                        else {
                            attrString += `${item.key}:{v:'${item.value}'}`;
                        }
                        if (index + 1 < attrLength) {
                            attrString += ","
                        }
                    });

                    optionStr += `${optionStr.length > 2 ? "," : ''} attr:{${attrString}}`;
                }

                optionStr += "}";
                return optionStr;
            }

            const addTagAndOption = (tagStr, optionStr) => {
                return tagStr + "," + optionStr + ")";
            };

            const handleFor = (tagStr, optionStr) => {
                let forExp = compiled.view.forExp;
                const { keys } = forExp.value;
                // const getRegex = (subStr) => {
                //     return new RegExp(subStr, 'g');
                // }
                return `...he((${forExp.key},${forExp.index}, returnKey)=>{
                            const option = ${optionStr};
                            return returnKey ? option.attr?.key?.v || ${forExp.index} : ${tagStr + ','} option )
                    
                        },${convertArrayToString(keys)},'for')
                `
                //return forStr;
            }
            const ifModified = compiled.view.ifExpModified;
            if (ifModified && ifModified.ifExp) {
                let allKeys = [];
                (() => {
                    const { expStr, keys } = ifModified.ifExp;
                    allKeys = allKeys.concat(keys);
                    str += `he(()=>{return ${expStr} ? ${addTagAndOption(handleTag(), handleOption())}`
                })();
                ifModified.ifElseList.forEach(item => {
                    const { expStr, keys } = item.view.ifExp.elseIfCond;
                    allKeys = allKeys.concat(keys);
                    str += `:${expStr} ? ${createJsEqFromCompiled(item)} `
                });

                let keysAsString = convertArrayToString(Array.from(new Set(allKeys)));
                let elseString;
                if (ifModified.else) {
                    elseString = createJsEqFromCompiled(ifModified.else);
                }
                else {
                    elseString = `ce()`;
                }
                str += `:${elseString} },${keysAsString})`
            }
            else {
                if (compiled.view.forExp) {
                    const tagStr = handleTag();
                    const op = handleOption();
                    str += handleFor(tagStr, op);
                }
                else {
                    str += addTagAndOption(handleTag(), handleOption());
                }
            }
        }
        else if (compiled.mustacheExp) {

            let method = `()=>{return ct(`;
            let brackets = "";
            compiled.filters.reverse().forEach(item => {
                method += `f('${item}',`
                brackets += ")"
            });
            handleLocalVar(compiled.localVars, compiled.mustacheExp);
            const { keys, expStr } = compiled.mustacheExp;
            method += `${expStr} ${brackets} )}`;
            str += `he(${method}, ${convertArrayToString(keys)})`
        }
        else if ((compiled as any).trim().length > 0) {
            str += `ct(${JSON.stringify(compiled)})`;
        }
        return str;
    }
    parentStr += `return ${createJsEqFromCompiled(compiledParent)}`;
    if (process.env.NODE_ENV != "production") {
        parentStr = beautify(parentStr, { indent_size: 4, space_in_empty_paren: true })
    }
    // console.log("parentstr", parentStr);
    try {
        return new Function('renderer', parentStr);
    } catch (error) {
        const fnString = "var str= `" + parentStr.toString() + "` ; new Function(str)";
        return new Function(fnString);
    }
}