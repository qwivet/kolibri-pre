import { Token, TokenType } from '../interfaces';

export const reviseTokens = (tokens: Array<Token>): Array<Token> => {
  const res = new Array<Token>();
  for (const token of tokens.filter(token => token.tokenType !== TokenType.Separator)) {
    const last = res[res.length - 1];
    const addOrConcat = (type: TokenType, symbBetween: string): void => {
      if (last !== undefined && last.tokenType === type) {
        last.value = last.value + symbBetween + token.value;
      } else {
        res.push(token);
      }
    };
    switch (token.tokenType) {
      case TokenType.Identifier:
        addOrConcat(TokenType.Identifier, ' ');
        break;
      case TokenType.Literal:
        const allPoints = (last.value + token.value).split('').filter(x => x === '.').length;
        if (allPoints > 1) throw new Error('Literal have several floating points');
        addOrConcat(TokenType.Literal, '');
        break;
      case TokenType.Patch:
      case TokenType.Limiter:
      case TokenType.Operator:
        res.push(token);
        break;
      case TokenType.Separator:
        break;
    }
  }
  return res;
};
