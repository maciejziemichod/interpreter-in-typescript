import {
    BlockStatement,
    BooleanLiteral,
    CallExpression,
    Expression,
    ExpressionStatement,
    FunctionLiteral,
    Identifier,
    IfExpression,
    InfixExpression,
    IntegerLiteral,
    LetStatement,
    PrefixExpression,
    Program,
    ReturnStatement,
    Statement,
} from "./ast";
import { Lexer } from "./lexer";
import { Token, TokenItem, TokenType } from "./token";

type prefixParseFunction = () => Expression | null;
type infixParseFunction = (expression: Expression | null) => Expression | null;

const Precendence = {
    LOWEST: 1,
    EQUALS: 2, // ==
    LESS_GREATER: 3, // > or <
    SUM: 4, // +
    PRODUCT: 5, // *
    PREFIX: 6, // -X or !X
    CALL: 7, // myFunction(X)
} as const;
type PrecendenceValue = (typeof Precendence)[keyof typeof Precendence];

const precedences = {
    [TokenType.EQUAL]: Precendence.EQUALS,
    [TokenType.NOT_EQUAL]: Precendence.EQUALS,
    [TokenType.LESS_THAN]: Precendence.LESS_GREATER,
    [TokenType.GREATER_THAN]: Precendence.LESS_GREATER,
    [TokenType.PLUS]: Precendence.SUM,
    [TokenType.MINUS]: Precendence.SUM,
    [TokenType.SLASH]: Precendence.PRODUCT,
    [TokenType.ASTERISK]: Precendence.PRODUCT,
    [TokenType.LEFT_PARENTHESIS]: Precendence.CALL,
} as const;

export class Parser {
    private lexer: Lexer;
    private currentToken: Token;
    private peekToken: Token;
    private errors: string[] = [];
    private prefixParseFunctions: Partial<{
        [key in TokenItem]: prefixParseFunction;
    }> = {};
    private infixParseFunctions: Partial<{
        [key in TokenItem]: infixParseFunction;
    }> = {};

    constructor(lexer: Lexer) {
        this.lexer = lexer;

        this.parseIdentifier = this.parseIdentifier.bind(this);
        this.parseIntegerLiteral = this.parseIntegerLiteral.bind(this);
        this.parsePrefixExpression = this.parsePrefixExpression.bind(this);
        this.parseInfixExpression = this.parseInfixExpression.bind(this);
        this.parseBooleanLiteral = this.parseBooleanLiteral.bind(this);
        this.parseGroupedExpression = this.parseGroupedExpression.bind(this);
        this.parseIfExpression = this.parseIfExpression.bind(this);
        this.parseFunctionLiteral = this.parseFunctionLiteral.bind(this);
        this.parseCallExpression = this.parseCallExpression.bind(this);

        this.registerPrefix(TokenType.IDENTIFIER, this.parseIdentifier);
        this.registerPrefix(TokenType.INT, this.parseIntegerLiteral);
        this.registerPrefix(TokenType.BANG, this.parsePrefixExpression);
        this.registerPrefix(TokenType.MINUS, this.parsePrefixExpression);
        this.registerPrefix(TokenType.TRUE, this.parseBooleanLiteral);
        this.registerPrefix(TokenType.FALSE, this.parseBooleanLiteral);
        this.registerPrefix(
            TokenType.LEFT_PARENTHESIS,
            this.parseGroupedExpression,
        );
        this.registerPrefix(TokenType.IF, this.parseIfExpression);
        this.registerPrefix(TokenType.FUNCTION, this.parseFunctionLiteral);

        this.registerInfix(TokenType.PLUS, this.parseInfixExpression);
        this.registerInfix(TokenType.MINUS, this.parseInfixExpression);
        this.registerInfix(TokenType.ASTERISK, this.parseInfixExpression);
        this.registerInfix(TokenType.SLASH, this.parseInfixExpression);
        this.registerInfix(TokenType.EQUAL, this.parseInfixExpression);
        this.registerInfix(TokenType.NOT_EQUAL, this.parseInfixExpression);
        this.registerInfix(TokenType.LESS_THAN, this.parseInfixExpression);
        this.registerInfix(TokenType.GREATER_THAN, this.parseInfixExpression);
        this.registerInfix(
            TokenType.LEFT_PARENTHESIS,
            this.parseCallExpression,
        );

        this.nextToken();
        this.nextToken();
    }

    public parseProgram(): Program {
        const program = new Program();
        program.statements = [];

        while (this.currentToken.type !== TokenType.EOF) {
            const statement = this.parseStatement();

            if (statement !== null) {
                program.statements.push(statement);
            }

            this.nextToken();
        }

        return program;
    }

    public getErrors(): string[] {
        return this.errors;
    }

    private peekError(type: TokenItem): void {
        this.errors.push(
            `expected next token to be ${type}, got ${this.peekToken.type} instead`,
        );
    }

    private nextToken(): void {
        this.currentToken = this.peekToken;
        this.peekToken = this.lexer.getNextToken();
    }

    private parseStatement(): Statement | null {
        switch (this.currentToken.type) {
            case TokenType.LET:
                return this.parseLetStatement();
            case TokenType.RETURN:
                return this.parseReturnStatement();
            default:
                return this.parseExpressionStatement();
        }
    }

    private parseLetStatement(): LetStatement | null {
        const statement = new LetStatement();
        statement.token = this.currentToken;

        if (!this.expectPeek(TokenType.IDENTIFIER)) {
            return null;
        }

        const name = new Identifier();
        name.value = this.currentToken.literal;
        name.token = this.currentToken;
        statement.name = name;

        if (!this.expectPeek(TokenType.ASSIGN)) {
            return null;
        }

        this.nextToken();

        const expression = this.parseExpression(Precendence.LOWEST);

        if (expression === null) {
            return null;
        }

        statement.value = expression;

        if (this.peekTokenIs(TokenType.SEMICOLON)) {
            this.nextToken();
        }

        return statement;
    }

    private parseReturnStatement(): ReturnStatement | null {
        const statement = new ReturnStatement();
        statement.token = this.currentToken;

        this.nextToken();

        const expression = this.parseExpression(Precendence.LOWEST);

        if (expression === null) {
            return null;
        }

        statement.returnValue = expression;

        if (this.peekTokenIs(TokenType.SEMICOLON)) {
            this.nextToken();
        }

        return statement;
    }

    private parseExpressionStatement(): ExpressionStatement | null {
        const statement = new ExpressionStatement();
        statement.token = this.currentToken;

        const expression = this.parseExpression(Precendence.LOWEST);

        if (expression === null) {
            return null;
        }

        statement.expression = expression;

        if (this.peekTokenIs(TokenType.SEMICOLON)) {
            this.nextToken();
        }

        return statement;
    }

    private noPrefixParseFunctions(type: TokenItem): void {
        this.errors.push(`no prefix parse function for ${type} found`);
    }

    private parseExpression(precendence: PrecendenceValue): Expression | null {
        const prefix = this.prefixParseFunctions[this.currentToken.type];

        if (prefix === undefined) {
            this.noPrefixParseFunctions(this.currentToken.type);
            return null;
        }

        let leftExpression = prefix();

        while (
            !this.peekTokenIs(TokenType.SEMICOLON) &&
            precendence < this.getPeekPrecedence()
        ) {
            const infix = this.infixParseFunctions[this.peekToken.type];

            if (infix === undefined) {
                return leftExpression;
            }

            this.nextToken();

            leftExpression = infix(leftExpression);
        }

        return leftExpression;
    }

    private currentTokenIs(type: TokenItem): boolean {
        return this.currentToken.type === type;
    }

    private peekTokenIs(type: TokenItem): boolean {
        return this.peekToken.type === type;
    }

    private expectPeek(type: TokenItem): boolean {
        if (this.peekTokenIs(type)) {
            this.nextToken();
            return true;
        } else {
            this.peekError(type);
            return false;
        }
    }

    private registerPrefix(
        tokenType: TokenItem,
        fn: prefixParseFunction,
    ): void {
        this.prefixParseFunctions[tokenType] = fn;
    }

    private registerInfix(tokenType: TokenItem, fn: infixParseFunction): void {
        this.infixParseFunctions[tokenType] = fn;
    }

    private parseIdentifier(): Expression {
        const identifier = new Identifier();
        identifier.token = this.currentToken;
        identifier.value = this.currentToken.literal;

        return identifier;
    }

    private parseIntegerLiteral(): Expression | null {
        const integerLiteral = new IntegerLiteral();

        integerLiteral.token = this.currentToken;

        const value = parseInt(this.currentToken.literal, 10);

        if (Number.isNaN(value)) {
            this.errors.push(
                `could not parse ${this.currentToken.literal} as integer`,
            );
            return null;
        }

        integerLiteral.value = value;

        return integerLiteral;
    }

    private parsePrefixExpression(): Expression | null {
        const expression = new PrefixExpression();
        expression.token = this.currentToken;
        expression.operator = this.currentToken.literal;

        this.nextToken();

        expression.right = this.parseExpression(Precendence.PREFIX);

        return expression;
    }

    private parseInfixExpression(left: Expression | null): Expression | null {
        const expression = new InfixExpression();
        expression.token = this.currentToken;
        expression.operator = this.currentToken.literal;
        expression.left = left;

        const precedence = this.getCurrentPrecedence();

        this.nextToken();

        expression.right = this.parseExpression(precedence);

        return expression;
    }

    private parseBooleanLiteral(): Expression {
        const booleanLiteral = new BooleanLiteral();
        booleanLiteral.token = this.currentToken;
        booleanLiteral.value = this.currentTokenIs(TokenType.TRUE);

        return booleanLiteral;
    }

    private parseGroupedExpression(): Expression | null {
        this.nextToken();

        const expression = this.parseExpression(Precendence.LOWEST);

        if (!this.expectPeek(TokenType.RIGHT_PARENTHESIS)) {
            return null;
        }

        return expression;
    }

    private parseIfExpression(): Expression | null {
        const expression = new IfExpression();
        expression.token = this.currentToken;

        if (!this.expectPeek(TokenType.LEFT_PARENTHESIS)) {
            return null;
        }

        this.nextToken();

        const condition = this.parseExpression(Precendence.LOWEST);

        if (condition === null) {
            return null;
        }

        expression.condition = condition;

        if (!this.expectPeek(TokenType.RIGHT_PARENTHESIS)) {
            return null;
        }

        if (!this.expectPeek(TokenType.LEFT_BRACE)) {
            return null;
        }

        expression.consequence = this.parseBlockStatement();

        if (this.peekTokenIs(TokenType.ELSE)) {
            this.nextToken();

            if (!this.expectPeek(TokenType.LEFT_BRACE)) {
                return null;
            }

            expression.alternative = this.parseBlockStatement();
        }

        return expression;
    }

    private parseFunctionLiteral(): Expression | null {
        const functionLiteral = new FunctionLiteral();
        functionLiteral.token = this.currentToken;

        if (!this.expectPeek(TokenType.LEFT_PARENTHESIS)) {
            return null;
        }

        functionLiteral.parameters = this.parseFunctionParameters();

        if (!this.expectPeek(TokenType.LEFT_BRACE)) {
            return null;
        }

        functionLiteral.body = this.parseBlockStatement();

        return functionLiteral;
    }

    private parseCallExpression(
        expression: Expression | null,
    ): Expression | null {
        const callExpression = new CallExpression();
        callExpression.token = this.currentToken;
        callExpression.expression = expression;
        callExpression.arguments = this.parseCallArguments();

        return callExpression;
    }

    private parseCallArguments(): Expression[] | null {
        const callArguments: Expression[] = [];

        if (this.peekTokenIs(TokenType.RIGHT_PARENTHESIS)) {
            this.nextToken();

            return callArguments;
        }

        this.nextToken();

        const firstArgument = this.parseExpression(Precendence.LOWEST);

        if (firstArgument !== null) {
            callArguments.push(firstArgument);
        }

        while (this.peekTokenIs(TokenType.COMMA)) {
            this.nextToken();
            this.nextToken();

            const nextArgument = this.parseExpression(Precendence.LOWEST);

            if (nextArgument !== null) {
                callArguments.push(nextArgument);
            }
        }

        if (!this.expectPeek(TokenType.RIGHT_PARENTHESIS)) {
            return null;
        }

        return callArguments;
    }

    private parseFunctionParameters(): Identifier[] | null {
        const identifiers: Identifier[] = [];

        if (this.peekTokenIs(TokenType.RIGHT_PARENTHESIS)) {
            this.nextToken();
            return identifiers;
        }

        this.nextToken();

        const identifier = new Identifier();
        identifier.token = this.currentToken;
        identifier.value = this.currentToken.literal;

        identifiers.push(identifier);

        while (this.peekTokenIs(TokenType.COMMA)) {
            this.nextToken();
            this.nextToken();

            const identifier = new Identifier();
            identifier.token = this.currentToken;
            identifier.value = this.currentToken.literal;

            identifiers.push(identifier);
        }

        if (!this.expectPeek(TokenType.RIGHT_PARENTHESIS)) {
            return null;
        }

        return identifiers;
    }

    private parseBlockStatement(): BlockStatement {
        const blockStatement = new BlockStatement();
        blockStatement.token = this.currentToken;
        blockStatement.statements = [];

        this.nextToken();

        while (
            !this.currentTokenIs(TokenType.RIGHT_BRACE) &&
            !this.currentTokenIs(TokenType.EOF)
        ) {
            const statement = this.parseStatement();

            if (statement !== null) {
                blockStatement.statements.push(statement);
            }

            this.nextToken();
        }

        return blockStatement;
    }

    private getPeekPrecedence(): PrecendenceValue {
        if (this.peekToken.type in precedences) {
            return precedences[this.peekToken.type];
        }

        return Precendence.LOWEST;
    }

    private getCurrentPrecedence(): PrecendenceValue {
        if (this.currentToken.type in precedences) {
            return precedences[this.currentToken.type];
        }

        return Precendence.LOWEST;
    }
}
