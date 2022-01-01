import { removeCommaFromLast } from "./remove_comma_from_last";
import { comparisionOpRegex, stringRegex } from "./constant";

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

export function createSetterForArray(value: string[], valueKey: string) {
    let string = "";
    value.forEach((val, index) => {
        if (stringRegex.test(val) === false && comparisionOpRegex.test(val) === false) {
            string += `${val} = ${valueKey}[${index}];`
        }
    });
    return string;
}