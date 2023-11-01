import { NULL_OBJ } from "./evaluator";
import {
    Builtin,
    ErrorObj,
    IntegerObj,
    StringObj,
    ValueObject,
} from "./object";

export const builtins = {
    len: new Builtin(function (...args: Array<ValueObject | null>) {
        if (args.length !== 1) {
            return new ErrorObj(
                `wrong number of arguments. got=${args.length}, want=1`,
            );
        }

        const arg = args[0];

        if (!(arg instanceof StringObj)) {
            return new ErrorObj(
                `argument to \`len\` not supported, got ${arg?.type()}`,
            );
        }

        return new IntegerObj(arg.value.length);
    }),
} as const;
