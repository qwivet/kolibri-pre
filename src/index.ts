export * from './Common';

import { pipeline, tokenize, reviseTokens } from './Lexer';
import { parse, printExpressionToStringBr, standardParserFlow } from './Parser';
import { createKolibriFile, createKolibriFileReader } from './Common';

const fileReader = createKolibriFileReader();
const file = createKolibriFile('/home/btw/projects/kolibrits/testfiles/test2.kol', fileReader);
const tokens = tokenize(file, pipeline);
const revisedTokens = reviseTokens(tokens);
const ast = parse(revisedTokens, standardParserFlow);
console.log(printExpressionToStringBr(ast[0]));
