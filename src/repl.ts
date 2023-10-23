import readline from "readline";
import { Lexer } from "./lexer";
import { Token, TokenType } from "./token";

export function startRepl(
    input: NodeJS.ReadableStream,
    output: NodeJS.WritableStream,
): void {
    const rl = readline.createInterface({
        input,
        output,
        prompt: ">> ",
    });

    rl.prompt();

    rl.on("line", (line) => {
        const lexer = new Lexer(line);

        for (
            let token: Token = lexer.getNextToken();
            token.type !== TokenType.EOF;
            token = lexer.getNextToken()
        ) {
            console.log(token);
        }

        rl.prompt();
    });
}
