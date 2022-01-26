import { parseview } from "./parse_view";
import { LogHelper } from "./utils";
import { ERROR_TYPE } from "./enums";
import { contextString } from "./constant";
import { ICompiledView, IIfExpModified } from "./interface";
import { unique } from "./unique";
import { removeCommaFromLast } from "./remove_comma_from_last";
import { convertArrayToString, createSetterForArray } from "./convert_array_to_comma_seperated_string";
import beautify from 'js-beautify';
import { IExpression } from "./add_ctx_to_expression";

export function createRenderer(template: string, moduleId?: string) {
    template = template.trim();
    let compiledParent;
    if (process.env.NODE_ENV == "test") {
        compiledParent = parseview(template);
    }
    else {
        try {
            compiledParent = parseview(template);
        } catch (ex) {
            let string = `console.error(${JSON.stringify(ex.message)});`;
            string += "const template=`" + JSON.stringify(template) + "`;"
            string += `const location=${JSON.stringify(ex.location)};`;
            string += `const css = 'background: #222; color: #bada55';`;
            string += `const lines = template.split("\\n");`
            string += ` console.log("%c" + lines.slice(0, location.start.line - 1).join("\\n") +
            "%c" + lines.slice(location.start.line - 1, location.end.line).join("\\n") +
            "%c" + lines.slice(location.end.line).join("\\n")
            , css, css + ';color:#ff0000', css);`;
            string += `return document.createComment('');`
            return new Function(string);
        }
    }

    // console.log("compiled", compiledParent);
    if (compiledParent.view) {
        if (compiledParent.view.forExp) {
            console.error(`Invalid template ${template}`);
            throw new LogHelper(ERROR_TYPE.ForExpAsRoot).get();
        }
    }
    let parentStr = `const ${contextString}= this;
    const ce = renderer.createElement;
    const ct = renderer.createTextNode;
    const f = renderer.format;
    const he = renderer.runExp;
    `;
    const createJsEqFromCompiled = (compiled: ICompiledView) => {
        let str = "";
        if (compiled.view) {
            const handleTag = () => {
                let tagHtml = `ce('${compiled.view.tag}',`
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
                    compiled.child.forEach((child, index) => {
                        if (!(child.view && child.view.ifExp)) {
                            return onIfCondEnd(index);
                        }
                        const ifExp = child.view.ifExp;
                        if (ifExp.ifCond) {
                            isIfCondEndFound = false;
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
                let optionStr = ",{";

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
                            handlerStr += item.replace(identifierRegex, 'ctx.$1') + ",";
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
                            dirBinding.value.push(dirValue.expStr)
                            dirBinding.props = [...dirBinding.props, ...dirValue.keys]
                            dirBinding.params.push(dirValue.raw)
                        })

                        optionStr += `${dirName}:{ 
                                get value(){ 
                                    return ${convertArrayToString(dirBinding.value, false)} 
                                },
                                set value(values){
                                    ${createSetterForArray(dirBinding.value, 'values')}
                                },
                                props:${convertArrayToString(dirBinding.props)},
                                params: ${convertArrayToString(dirBinding.value, false)}
                              },
                            `;

                    }
                    optionStr = removeCommaFromLast(optionStr) + "}";
                    // optionStr += "}"
                }

                if (compiled.view.html) {
                    optionStr += `${optionStr.length > 2 ? "," : ''} html:ctx.${compiled.view.html}`;
                }

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
                            if (item.filters.length > 0) {
                                let method = `()=>{return `;
                                let brackets = "";
                                item.filters.reverse().forEach(item => {
                                    method += `f('${item}',`
                                    brackets += ")"
                                });
                                method += `${val.expStr} ${brackets} }`;
                                attrString += `${item.key}:{v: ${method},k:'${val.keys[0]}', m:true}`;
                            }
                            else {
                                const attributeValue = val.expStr;
                                attrString += `${item.key}:{v: ${attributeValue},k:'${val.keys[0]}'}`;
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

                optionStr += "})";
                return optionStr;
            }

            const handleFor = (value: string) => {
                let forExp = compiled.view.forExp;
                const { keys } = forExp.value;
                const getRegex = (subStr) => {
                    return new RegExp(subStr, 'g');
                }
                return `...he((${forExp.key},${forExp.index})=>{
                            return ${value.replace(getRegex(`ctx.${forExp.key}`), forExp.key).
                        replace(getRegex(`ctx.${forExp.index}`), forExp.index)
                    }
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
                    str += `he(()=>{return ${expStr} ? ${handleTag() + handleOption()}`
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
                    str += handleFor(handleTag() + handleOption())
                }
                else {
                    str += handleTag() + handleOption()
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
            const { keys, expStr } = compiled.mustacheExp;
            method += `${expStr} ${brackets} )}`;
            str += `he(${method}, ${convertArrayToString(keys)},${unique()})`
        }
        else if ((compiled as any).trim().length > 0) {
            str += `ct('${compiled}')`;
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