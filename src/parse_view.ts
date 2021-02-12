import * as parser from '../build/parser';
import { ERROR_TYPE } from './enums';
import { LogHelper } from './utils';
import { ICompiledView } from './interface';

export function parseview(viewCode: string) {

    // viewCode = viewCode.replace(new RegExp('\n', 'g'), '').trim();
    // viewCode = viewCode.trim();
    return parser.parse(viewCode) as ICompiledView;
}