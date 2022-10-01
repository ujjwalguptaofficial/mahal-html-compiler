export function getObjectLength(value): number {
    return value.length || Object.keys(value).length;
}