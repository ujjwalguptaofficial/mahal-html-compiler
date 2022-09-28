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
            const indexOfKey = exp.keys.findIndex(q => {
                return q.includes && q.includes(forExp.key + ".")
            });
            if (indexOfKey >= 0) {
                (exp.keys[indexOfKey] as any) = eval(`() => {
                    return '${forExp.value.raw}['+${forExp.index}+']';
                }`);

                //  `${forExp.value.raw}[` + forExp.index + `]`;
            }
        }
        const index = expStr.indexOf(expressionToCheck)
        if (index >= 0) {
            const nextChar = expStr[index + expressionToCheck.length];
            if (nextChar && nextChar.match(alphabetRegex)) {
                return;
            }
            exp.expStr = expStr.replace(expressionToCheck, localVar);
            const indexOfKey = exp.keys.findIndex(q => q === localVar);
            // if (indexOfKey >= 0) {
            exp.keys.splice(indexOfKey, 1);
            // }
        }
    })
}