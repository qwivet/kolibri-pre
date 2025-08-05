export * from './common';

import { pipeline, tokenize, reviseTokens } from './lexer';
import { parse, printExpressionToStringBr, standardParserFlow } from './parser';
import { createKolibriFile, createKolibriFileReader } from './common';

const fileReader = createKolibriFileReader();
const file = createKolibriFile('/home/btw/projects/kolibrits/testfiles/test2.kol', fileReader);
const tokens = tokenize(file, pipeline);
const revisedTokens = reviseTokens(tokens);
const ast = parse(revisedTokens, standardParserFlow);
console.log(printExpressionToStringBr(ast[0]));
