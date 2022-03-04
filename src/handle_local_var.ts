import { IExpression } from "./add_ctx_to_expression";
import { CONTEXT_STRING } from "./constant";

export const handleLocalVar = (localVars: string[], exp: IExpression) => {
    (localVars || []).forEach(localVar => {
        const expressionToCheck = CONTEXT_STRING + "." + localVar;
        if (exp.expStr.includes(expressionToCheck)) {
            exp.expStr = exp.expStr.replace(expressionToCheck, localVar);
            const indexOfKey = exp.keys.findIndex(q => q === localVar);
            exp.keys.splice(indexOfKey, 1);
        }
    })
}