import { removeCommaFromLast } from "./remove_comma_from_last";
import { comparisionOpRegex, stringRegex } from "./constant";
import { IDirectiveBinding } from "./interface";

export function convertArrayToString(value: string[], shouldAddSingleQuote = true) {
    let result = "[";
    value.forEach(val => {
        result += (shouldAddSingleQuote === true ? (
            stringRegex.test(val) === true ? val : `'${val}'`) :
            val) + ","
    })
    result = removeCommaFromLast(result);
    result += "]"
    return result;
}

export function createSetterForDirective(dirBinding: { value: any[], params: any[] }, ctx: string) {
    let string = "";
    const valueKey: string = "values";
    dirBinding.value.forEach((val, index) => {
        if (stringRegex.test(val) === false && comparisionOpRegex.test(val) === false) {
            if (val === dirBinding.params[index]) {
                string += `${val} = ${valueKey}[${index}];`
            }
            else {
                string += `${ctx}.setState('${val.replace(`${ctx}.`, '')}', ${valueKey}[${index}]);`
            }
            // console.log('val', val, string);

        }
    });
    // console.log('valstring', string);

    return string;
}