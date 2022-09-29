import { IExpression } from "./add_ctx_to_expression";
import { CONTEXT_STRING } from "./constant";
import { IForExp } from "./interface";

const alphabetRegex = /[a-z]|[A-Z]|[_]/;

export const handleLocalVar = (localVars: string[], exp: IExpression) => {
    localVars = localVars || [];
    const forExp = localVars['forExp'] as IForExp;
    (localVars || []).forEach(localVar => {
        const expressionToCheck = CONTEXT_STRING + "." + localVar;
        const expStr = exp.expStr;
        if (forExp) {
            const forExpkeyWithDot = forExp.key;//+ ".";
            const expKeys = exp.keys;
            const indexOfKey = expKeys.findIndex(q => {
                return q.includes && q.includes(forExpkeyWithDot)
            });
            if (indexOfKey >= 0) {
                const foundExpKey = expKeys[indexOfKey];
                const splittedKey = foundExpKey.split('.');
                const lastStr = splittedKey.length > 1 ? '.' + splittedKey.slice(1).join('.') : '';
                (expKeys[indexOfKey] as any) = eval(`() => 
                '${forExp.value.raw}.'+${forExp.index} + '${lastStr}';
                `);
            }

            // if (typeof expStr === 'string') {
            //     const index = expStr.indexOf(expressionToCheck);
            //     if (index >= 0) {
            //         const replacedExp = expStr.replace(expressionToCheck, localVar);
            //         debugger;
            //         exp.expStr = exp.expStr.substr(0, index) + `(() => {
            //             return  '${forExp.value.raw}.'+${forExp.index} }
            //         })()` + exp.expStr.substr(index + expressionToCheck.length);
            //         // exp.expStr =  eval(`() => {
            //         //     return  '${forExp.value.raw}.'+${forExp.index} + '.${exp.expStr.split('.').slice(2).join('.')}';
            //         // }`)  
            //     }
            // }

        }
        const index = expStr.indexOf(expressionToCheck)
        if (index >= 0) {
            const nextChar = expStr[index + expressionToCheck.length];
            if (nextChar && nextChar.match(alphabetRegex)) {
                return;
            }
            exp.expStr = expStr.replace(expressionToCheck, localVar);
            const indexOfKey = exp.keys.findIndex(q => q === localVar);
            if (indexOfKey >= 0) {
                exp.keys.splice(indexOfKey, 1);
            }
        }
    })
}