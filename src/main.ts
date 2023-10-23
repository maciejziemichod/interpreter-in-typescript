import os from "os";
import { startRepl } from "./repl";

function init(): void {
    console.log(`Hello ${
        os.userInfo().username
    }! This is the Monkey programming language!
Feel free to type in commands`);

    startRepl(process.stdin, process.stdout);
}

init();
