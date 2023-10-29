import readline from "readline";
import { Lexer } from "./lexer";
import { Parser } from "./parser";
import { TokenType } from "./token";
import { evalNode } from "./evaluator";

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
        const parser = new Parser(lexer);

        const program = parser.parseProgram();

        if (parser.getErrors().length !== 0) {
            printParserErrors(parser.getErrors());

            return;
        }

        const evaluated = evalNode(program);

        if (evaluated !== null) {
            console.log(evaluated.inspect());
        }

        rl.prompt();
    });
}

function printParserErrors(errors: string[]): void {
    console.log(`
            __,__
   .--.  .-"     "-.  .--.
  / .. \\/  .-. .-.  \\/ .. \\
 | |  '|  /   Y   \\  |'  | |
 | \\   \\  \\ 0 | 0 /  /   / |
  \\ '- ,\\.-"'' ''"-./, -' /
   ''-' /_   ^ ^   _\\ '-''
       |  \\._   _./  |
       \\   \\ '~' /   /
        '._ '-=-' _.'
           '~---~'
`);
    console.log("Woops! We ran into some monkey business here!");
    console.log(" parser errors:");

    errors.forEach((error) => {
        console.log(`\t${error}\n`);
    });
}
