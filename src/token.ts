export const TokenType = {
    ILLEGAL: "ILLEGAL",
    EOF: "EOF",

    IDENTIFIER: "IDENTIFIER",

    STRING: "STRING",
    INT: "INT",

    ASSIGN: "=",
    BANG: "!",
    GREATER_THAN: ">",
    LESS_THAN: "<",
    PLUS: "+",
    MINUS: "-",
    ASTERISK: "*",
    SLASH: "/",

    EQUAL: "==",
    NOT_EQUAL: "!=",

    COMMA: ",",
    SEMICOLON: ";",
    COLON: ":",

    LEFT_PARENTHESIS: "(",
    RIGHT_PARENTHESIS: ")",
    LEFT_BRACKET: "[",
    RIGHT_BRACKET: "]",
    LEFT_BRACE: "{",
    RIGHT_BRACE: "}",

    FUNCTION: "FUNCTION",
    LET: "LET",
    TRUE: "TRUE",
    FALSE: "FALSE",
    NULL: "NULL",
    IF: "IF",
    ELSE: "ELSE",
    RETURN: "RETURN",
} as const;

export type TokenItem = (typeof TokenType)[keyof typeof TokenType];

export type Token = {
    type: TokenItem;
    literal: string;
};

const keywords = {
    fn: TokenType.FUNCTION,
    let: TokenType.LET,
    true: TokenType.TRUE,
    false: TokenType.FALSE,
    null: TokenType.NULL,
    if: TokenType.IF,
    else: TokenType.ELSE,
    return: TokenType.RETURN,
} as const;

function isKeyword(key: string): key is keyof typeof keywords {
    return key in keywords;
}

export function lookupIdentifier(identifier: string): TokenItem {
    return isKeyword(identifier) ? keywords[identifier] : TokenType.IDENTIFIER;
}
