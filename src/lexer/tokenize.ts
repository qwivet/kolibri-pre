import { Token, TokenType, IKolibriFile } from '../interfaces';

export const tokenize = (file: IKolibriFile, pipeline: Array<[RegExp, TokenType]>): Array<Token> => {
  const text = file.readFile();
  var res = new Array<Token>();

  outer: for (var i = 0; i < text.length; ) {
    for (var part of pipeline) {
      const match = text.slice(i).match(part[0]);
      if (match !== null && match.index === 0) {
        res.push({ value: match[0], tokenType: part[1], file: file, index: i });
        i += match[0].length;
        continue outer;
      }
    }
    throw new Error(`Unknown token on index ${i}`);
  }
  return res;
};
