import { parseview } from "./parse_view";
import { getObjectLength, isOnlySpaces, LogHelper } from "./utils";
import { ERROR_TYPE } from "./enums";
import { CONTEXT_STRING } from "./constant";
import { ICompiledView, IForExp, IIfExpModified } from "./interface";
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
    const createEl = renderer.createEl.bind(${CONTEXT_STRING});
    const ct = renderer.createTextNode;
    const FORMAT = 'format';
    const HANDLE_EXPRESSION = '_handleExp_';
    const addRc_ = renderer.addRc;
    const ctwrc = renderer.createTextNodeWithRc;
    const hewrc = renderer.handleExpWithRc;
    const hfewrc = renderer.handleForExpWithRc;
    `;
    const createJsEqFromCompiled = (compiled: ICompiledView, dependent?: string) => {
        let str = "";
        if (compiled.view) {
            const handleTag = (type?: string) => {
                const htmlTag = compiled.view.tag;
                let tagHtml = htmlTag == null ? `createEl(null,` : `createEl('${htmlTag}',`

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
                    let localVars = compiled.localVars || {};
                    if (forExp) {
                        const forExpkey = forExp.key;
                        const forExpindex = forExp.index;
                        const forValue = forExp.value.raw;
                        localVars[forExpkey] = [
                            forExpkey,
                            `${forExpkey}.`,
                            `${forExpkey}[`,
                            forExpindex,
                            `${forValue}[${forExpindex}]`
                        ]
                        localVars[forExpkey]['forExp'] = forExp;
                    }
                    compiled.child.forEach((child, index) => {
                        if (typeof child === 'object') {
                            child.localVars = {};
                            if (localVars) {
                                for (const key in localVars) {
                                    const localVarsValue = localVars[key];
                                    if (!child.localVars[key]) {
                                        child.localVars[key] = [];
                                    }
                                    child.localVars[key] = child.localVars[key].concat(
                                        localVarsValue
                                    )

                                    if (localVarsValue['forExp']) {
                                        child.localVars[key]['forExp'] = localVarsValue['forExp'];
                                    }
                                }
                            }

                        }
                        if (!(child.view && child.view.ifExp)) {
                            return onIfCondEnd(index);
                        }
                        const ifExp = child.view.ifExp;
                        if (ifExp.ifCond) {
                            if (ifModifiedExpression) {
                                onIfCondEnd(index);
                            }
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
                        let childCompiled = createJsEqFromCompiled(item, type);
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

            const handleOption = (type?: string) => {
                let optionStr = "{";
                // handle event
                const eventLength = compiled.view.events.length;
                if (eventLength > 0) {
                    let eventStr = "";
                    // const identifierRegex = /([a-zA-Z]+)/g
                    // const identifierRegex = /\b(?!(?:false\b))([\w]+)/g
                    const identifierRegex = /\b(?!(?:false|true\b))([a-zA-Z.]+)/g
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
                        eventStr += `${ev.name}: ${handlerStr}`;
                        if (index + 1 < eventLength) {
                            eventStr += ","
                        }
                    });
                    optionStr += `on:{${eventStr}}`;
                }
                let { isRcFound, localVarKey } = { isRcFound: false, localVarKey: null };
                if (compiled.view.dir) {
                    optionStr += `${optionStr.length > 2 ? "," : ''} dir:{`;
                    for (const dirName in compiled.view.dir) {
                        // optionStr += `${dirName}:{ `
                        const dirBinding = {
                            value: [],
                            props: [],
                            params: [],
                            rcKeys: null
                        }
                        compiled.view.dir[dirName].forEach(dirValue => {
                            const rcKeys = handleLocalVar(compiled.localVars, dirValue);
                            dirBinding.value.push(dirValue.expStr)
                            if (rcKeys.isAny()) {
                                dirBinding.rcKeys = rcKeys.keys;
                                isRcFound = true;
                                localVarKey = rcKeys.localVar;
                            }
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
                                params: ${convertArrayToString(dirBinding.value, false)}`;
                        if (dirBinding.rcKeys) {
                            optionStr += `,rc:${convertArrayToString(dirBinding.rcKeys)}`
                        }
                        optionStr += `},`;

                    }
                    optionStr = removeCommaFromLast(optionStr) + "}";
                    // optionStr += "}"
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

                switch (compiled.view.tag) {
                    case 'slot':
                    case 'target':
                        if (!attr.find(q => q.key === "'name'")) {
                            attr.push({
                                key: 'name',
                                value: 'default',
                                isExpression: false,
                                filters: []
                            });
                        }
                }

                const attrLength = attr.length;
                if (attrLength > 0 || compiled.view.forExp) {
                    let attrString = '';
                    let reactiveAttrString = '';
                    attr.forEach((item, index) => {
                        if (item.isExpression) {
                            const val: IExpression = item.value as IExpression;
                            let rcKeys = handleLocalVar(compiled.localVars, val);
                            if (item.key === "'key'") {
                                rcKeys = [] as any;
                            }
                            if (rcKeys.length > 0) {
                                // rc[rcKey] = 1;
                                isRcFound = true;
                                localVarKey = rcKeys.localVar;
                            }
                            const getKey = () => {
                                return val.keys.length > 0 ? convertArrayToString(val.keys) : null
                            }
                            const getRcKey = () => {
                                return rcKeys.length > 0 ? convertArrayToString(rcKeys.keys) : null
                            }
                            const keyToWatch = getKey();
                            const strForKeyToWatch = keyToWatch ? `,k:${keyToWatch}` : ''
                            const rcKeyToWatch = getRcKey();
                            const strForRcKey = rcKeyToWatch ? `,rc:${rcKeyToWatch}` : ''
                            let method;
                            if (item.filters.length > 0) {
                                method = `{return `;
                                let brackets = "";
                                item.filters.reverse().forEach(item => {
                                    method += `${CTX}[FORMAT]('${item}',`
                                    brackets += ")"
                                });
                                method += `${val.expStr} ${brackets} }`;
                                // reactiveAttrString += `${item.key}:{get v() ${method} ${strForKeyToWatch} ${strForRcKey}}`;
                            }
                            else {
                                method = `{ return ${val.expStr} }`;

                                // reactiveAttrString += `${item.key}:{get v() ${attributeValue} ${strForKeyToWatch} ${strForRcKey}}`;
                            }
                            reactiveAttrString += `${item.key}:{get v() ${method} ${strForKeyToWatch} ${strForRcKey}}`;
                        }
                        else {
                            attrString += `${item.key}:{v:'${item.value}'}`;
                        }
                        if (index + 1 < attrLength) {
                            if (item.isExpression) {
                                reactiveAttrString += ","
                            }
                            else {
                                attrString += ","
                            }
                        }
                    });
                    if (attrString.length > 0) {
                        optionStr += `${optionStr.length > 2 ? "," : ''} attr:{${attrString}}`;
                    }

                    if (reactiveAttrString.length > 0) {
                        optionStr += `${optionStr.length > 2 ? "," : ''} rAttr:{${reactiveAttrString}}`;
                    }

                }

                if (isRcFound) {
                    optionStr += `${optionStr.length > 2 ? "," : ''} rcm:()=>addRc_${localVarKey}`;
                }


                // if (getObjectLength(rc) != 0) {
                //     optionStr += `${optionStr.length > 2 ? "," : ''} rc:[${JSON.stringify(rc)},()=>addRc]`;
                // }

                optionStr += "}";
                if (optionStr === '{}') {
                    optionStr = '';
                }
                return optionStr;
            }

            const addTagAndOption = (tagStr, optionStr) => {
                return tagStr + "," + optionStr + ")";
            };

            const handleFor = (tagStr, optionStr) => {
                let forExp = compiled.view.forExp;

                // const getRegex = (subStr) => {
                //     return new RegExp(subStr, 'g');
                // }
                optionStr = optionStr || '{rAttr:{}}';
                let method = `(${forExp.key},${forExp.index}, returnKey)=>{
                    let addRc_${forExp.key};
                    const option = ${optionStr};
                    let attr = option.rAttr;
                    if(!attr){
                        attr = option.rAttr = {};
                    }
                    if(!attr.key) {
                        attr.key=   {v :  ${forExp.index}}
                    }
                    return returnKey ? attr.key.v :  (()=>{ 
                        const rc = new Map();
                        addRc_${forExp.key}= addRc_.bind(rc);
                        const _el_ = ${tagStr + ','} option );
                        // stands for reactive child
                        _el_._rc_ = rc;
                        _el_. _setVal_ = (newValue)=>{
                            ${forExp.key} = newValue;
                        }
                        return _el_; 
                    })()
            
                }`;
                const { keys } = forExp.value;
                const localVarResult = handleLocalVar(compiled.localVars, forExp.value);

                const forExpKeys = keys.map(key => {
                    for (const localVarKey in compiled.localVars) {
                        if (key === localVarKey) {
                            const localVarsValue = compiled.localVars[localVarKey];
                            const forExp = localVarsValue['forExp'] as IForExp;
                            return `(()=>{
                               return '${forExp.value.raw}.'+ ${forExp.index};
                            })()`
                        }
                    }
                    return key;
                })


                let forExpStr = `${CTX}[HANDLE_EXPRESSION](${method},${convertArrayToString(forExpKeys)},'for')`;
                if (localVarResult.isAny()) {
                    const expression = `()=> ${forExpStr}`
                    forExpStr = `...hfewrc(${convertArrayToString(localVarResult.keys)},${expression},addRc_${localVarResult.localVar})`
                }
                else {
                    forExpStr = "..." + forExpStr;
                }
                return forExpStr;
                //return forStr;
            }
            const ifModified = compiled.view.ifExpModified;
            if (ifModified && ifModified.ifExp) {
                let allKeys = [];
                let method = '';
                const depKeys = [];
                let localVarForRc;
                const addDependency = (expression: IExpression) => {
                    const rcKeys = handleLocalVar(compiled.localVars, expression);
                    // const depKey = replaceDependent(expStr, dependent);
                    if (rcKeys.length > 0) {
                        depKeys.push(...rcKeys.keys);
                        localVarForRc = rcKeys.localVar;
                    }
                }
                (() => {
                    addDependency(ifModified.ifExp);
                    const { expStr, keys } = ifModified.ifExp;
                    allKeys = allKeys.concat(keys);
                    method += `()=>{return ${expStr} ? ${addTagAndOption(handleTag(dependent), handleOption())}`
                })();
                ifModified.ifElseList.forEach(item => {
                    addDependency(item.view.ifExp.elseIfCond);
                    const { expStr, keys } = item.view.ifExp.elseIfCond;
                    allKeys = allKeys.concat(keys);
                    method += `:${expStr} ? ${createJsEqFromCompiled(item, dependent)} `
                });

                let keysAsString = convertArrayToString(Array.from(new Set(allKeys)));
                let elseString;
                if (ifModified.else) {
                    elseString = createJsEqFromCompiled(ifModified.else, dependent);
                }
                else {
                    elseString = `createEl()`;
                }
                method += `:${elseString} }`
                if (depKeys.length > 0) {
                    let wrapperMethod = `hewrc(${convertArrayToString(depKeys)}, ${method}, addRc_${localVarForRc})`;
                    method = wrapperMethod;
                }
                if (allKeys.length > 0) {
                    if (depKeys.length > 0) {
                        method = `()=>` + method;
                    }
                    str += `${CTX}[HANDLE_EXPRESSION](${method},${keysAsString})`;
                }
                else {
                    str += method;
                }
            }
            else {
                let forExp = compiled.view.forExp;
                if (forExp) {
                    const tagStr = handleTag(forExp.key);
                    const op = handleOption(forExp.key);
                    str += handleFor(tagStr, op);
                }
                else {
                    str += addTagAndOption(handleTag(dependent), handleOption(dependent));
                }
            }
        }
        else if (compiled.mustacheExp) {
            const rcKeys = handleLocalVar(compiled.localVars, compiled.mustacheExp);
            const { keys, expStr } = compiled.mustacheExp;

            let expForMustacheContent = '';

            expForMustacheContent += 'ct(';
            let brackets = "";
            compiled.filters.reverse().forEach(item => {
                expForMustacheContent += `${CTX}[FORMAT]('${item}',`
                brackets += ")"
            });

            expForMustacheContent += `${expStr} ${brackets} ) `;

            expForMustacheContent += keys.length > 0 ? '}' : '';

            // const depKey = replaceDependent(expStr, dependent);
            if (rcKeys.length > 0) {
                let wrapperMethod = `ctwrc(${convertArrayToString(rcKeys.keys)},${expForMustacheContent},addRc_${rcKeys.localVar})`
                expForMustacheContent = wrapperMethod;
            }

            if (keys.length > 0) {
                str += `${CTX}[HANDLE_EXPRESSION](()=>{  return ${expForMustacheContent}, ${convertArrayToString(keys)})`;
            }
            else {
                str += expForMustacheContent;
            }
        }
        else if ((compiled as any).length > 0 && (isOnlySpaces(compiled) || (compiled as any).trim().length > 0)) {
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