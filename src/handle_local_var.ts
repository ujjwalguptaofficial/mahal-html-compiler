import { IExpression } from "./add_ctx_to_expression";
import { CONTEXT_STRING } from "./constant";
import { IForExp } from "./interface";

const alphabetRegex = /[a-z]|[A-Z]|[_]/;

export const handleLocalVar = (localVars: string[], exp: IExpression) => {
    const rcKeys: string[] = [];
    localVars = localVars || [];
    const forExp = localVars['forExp'] as IForExp;
    localVars.forEach(localVar => {
        const expressionToCheck = CONTEXT_STRING + "." + localVar;
        const expStr = exp.expStr;
        const index = expStr.indexOf(expressionToCheck)
        if (index >= 0) {
            const nextChar = expStr[index + expressionToCheck.length];
            if (nextChar && nextChar.match(alphabetRegex)) {
                return;
            }

            const regexExpressionToCheck = new RegExp(expressionToCheck, 'g');
            exp.expStr = expStr.replace(regexExpressionToCheck, localVar);


            exp.keys = exp.keys.filter((key, i) => {
                if (key.includes(localVar)) {
                    const localVarWithDot = localVar + '.';
                    const strToReplace = key.includes(localVarWithDot) ? localVarWithDot : localVar;
                    if (strToReplace != forExp.index) {
                        const rcKey = key.replace(strToReplace, '');
                        rcKeys.push(
                            rcKey
                        );
                    }
                    return false;
                }
                return true;
            })

            // indexesOfKey.forEach(indexOfKey => {
            //     // const indexOfKey = exp.keys.findIndex(q => q.includes(localVar));
            //     // if (indexOfKey >= 0) {

            //     // }
            // })


        }
    })
    return rcKeys;
}