import { IExpression } from "./add_ctx_to_expression";
import { CONTEXT_STRING } from "./constant";
import { IForExp } from "./interface";

const alphabetRegex = /[a-z]|[A-Z]|[_]/;

class RcKeyStore {

    keys = [];
    localVar: string;

    get length() {
        return this.keys.length;
    }

    isAny() {
        return this.length > 0;
    }

    add(varKey, rcKey) {
        this.localVar = varKey;
        this.keys.push(
            rcKey
        );
    }
}

export const handleLocalVar = (localVars: { [key: string]: string[] }, exp: IExpression) => {
    const rcKeys = new RcKeyStore();
    localVars = localVars || {};
    for (const localVarsKey in localVars) {
        const localVarsValue = localVars[localVarsKey];
        const forExp = localVarsValue['forExp'] as IForExp;

        localVarsValue.forEach(localVar => {
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
                            rcKeys.add(
                                localVarsKey, rcKey
                            );
                        }
                        return false;
                    }
                    return true;
                })
            }
        })
    }

    return rcKeys;
}