import { IExpression } from "./add_ctx_to_expression";
import { CONTEXT_STRING } from "./constant";

const alphabetRegex = /[a-z]|[A-Z]|[_]/;

export const handleLocalVar = (localVars: string[], exp: IExpression) => {
    const rcKeys: string[] = [];
    (localVars || []).forEach(localVar => {
        const expressionToCheck = CONTEXT_STRING + "." + localVar;
        const expStr = exp.expStr;
        const index = expStr.indexOf(expressionToCheck)
        if (index >= 0) {
            const nextChar = expStr[index + expressionToCheck.length];
            if (nextChar && nextChar.match(alphabetRegex)) {
                return;
            }
            exp.expStr = expStr.replace(expressionToCheck, localVar);
            const indexOfKey = exp.keys.findIndex(q => q.includes(localVar));
            if (indexOfKey >= 0) {
                const deletedKey = exp.keys.splice(indexOfKey, 1)[0];
                const localVarWithDot = localVar + '.';
                const strToReplace = deletedKey.includes(localVarWithDot) ? localVarWithDot : localVar;
                rcKeys.push(
                    deletedKey.replace(strToReplace, '')
                );
            }
        }
    })
    return rcKeys[0];
}