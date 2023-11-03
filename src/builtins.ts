import { NULL_OBJ } from "./evaluator";
import {
    ArrayObj,
    Builtin,
    ErrorObj,
    IntegerObj,
    StringObj,
    ValueObject,
} from "./object";

export const builtins = {
    len: new Builtin(function (
        ...args: Array<ValueObject | null>
    ): ValueObject {
        if (args.length !== 1) {
            return new ErrorObj(
                `wrong number of arguments. got=${args.length}, want=1`,
            );
        }

        const arg = args[0];

        if (arg instanceof StringObj) {
            return new IntegerObj(arg.value.length);
        } else if (arg instanceof ArrayObj) {
            return new IntegerObj(arg.elements.length);
        } else {
            return new ErrorObj(
                `argument to \`len\` not supported, got ${arg?.type()}`,
            );
        }
    }),

    first: new Builtin(function (
        ...args: Array<ValueObject | null>
    ): ValueObject {
        if (args.length !== 1) {
            return new ErrorObj(
                `wrong number of arguments. got=${args.length}, want=1`,
            );
        }

        const arg = args[0];

        if (!(arg instanceof ArrayObj)) {
            return new ErrorObj(
                `argument to \`first\` must be ARRAY, got ${arg?.type()}`,
            );
        }

        if (arg.elements.length === 0) {
            return NULL_OBJ;
        }

        return arg.elements[0];
    }),

    last: new Builtin(function (
        ...args: Array<ValueObject | null>
    ): ValueObject {
        if (args.length !== 1) {
            return new ErrorObj(
                `wrong number of arguments. got=${args.length}, want=1`,
            );
        }

        const arg = args[0];

        if (!(arg instanceof ArrayObj)) {
            return new ErrorObj(
                `argument to \`last\` must be ARRAY, got ${arg?.type()}`,
            );
        }

        if (arg.elements.length === 0) {
            return NULL_OBJ;
        }

        return arg.elements[arg.elements.length - 1];
    }),

    rest: new Builtin(function (
        ...args: Array<ValueObject | null>
    ): ValueObject {
        if (args.length !== 1) {
            return new ErrorObj(
                `wrong number of arguments. got=${args.length}, want=1`,
            );
        }

        const arg = args[0];

        if (!(arg instanceof ArrayObj)) {
            return new ErrorObj(
                `argument to \`rest\` must be ARRAY, got ${arg?.type()}`,
            );
        }

        if (arg.elements.length === 0) {
            return NULL_OBJ;
        }

        return new ArrayObj(arg.elements.slice(1));
    }),

    push: new Builtin(function (
        ...args: Array<ValueObject | null>
    ): ValueObject {
        if (args.length !== 2) {
            return new ErrorObj(
                `wrong number of arguments. got=${args.length}, want=2`,
            );
        }

        const array = args[0];
        const element = args[1];

        if (!(array instanceof ArrayObj)) {
            return new ErrorObj(
                `first argument to \`push\` must be ARRAY, got ${array?.type()}`,
            );
        }

        if (element === null) {
            return new ErrorObj("invalid second argument to `push`");
        }

        return new ArrayObj([...array.elements, element]);
    }),

    puts: new Builtin(function (
        ...args: Array<ValueObject | null>
    ): ValueObject {
        args.forEach((value) => {
            console.log(value?.inspect());
        });

        return NULL_OBJ;
    }),
} as const;
