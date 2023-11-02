import { BlockStatement, Identifier } from "./ast";
import { Environment } from "./environment";

export const ObjectType = {
    INTEGER_OBJ: "INTEGER",
    STRING_OBJ: "STRING",
    BOOLEAN_OBJ: "BOOLEAN",
    NULL_OBJ: "NULL",
    RETURN_VALUE_OBJ: "RETURN_VALUE",
    ERROR_OBJ: "ERROR",
    FUNCTION_OBJ: "FUNCTION",
    BUILTIN_OBJ: "BUILTIN",
    ARRAY_OBJ: "ARRAY",
} as const;

type ObjectTypeItem = (typeof ObjectType)[keyof typeof ObjectType];

export interface ValueObject {
    type(): ObjectTypeItem;
    inspect(): string;
}

export class IntegerObj implements ValueObject {
    public value: number;

    constructor(value: number) {
        this.value = value;
    }

    public type(): ObjectTypeItem {
        return ObjectType.INTEGER_OBJ;
    }

    public inspect(): string {
        return this.value.toString();
    }
}

export class StringObj implements ValueObject {
    public value: string;

    constructor(value: string) {
        this.value = value;
    }

    public type(): ObjectTypeItem {
        return ObjectType.STRING_OBJ;
    }

    public inspect(): string {
        return this.value;
    }
}

export class BooleanObj implements ValueObject {
    public value: boolean;

    constructor(value: boolean) {
        this.value = value;
    }

    public type(): ObjectTypeItem {
        return ObjectType.BOOLEAN_OBJ;
    }

    public inspect(): string {
        return String(this.value);
    }
}

export class NullObj implements ValueObject {
    public type(): ObjectTypeItem {
        return ObjectType.NULL_OBJ;
    }

    public inspect(): string {
        return "null";
    }
}

export class ReturnValue implements ValueObject {
    public value: ValueObject | null;

    constructor(value: ValueObject | null) {
        this.value = value;
    }

    public type(): ObjectTypeItem {
        return ObjectType.RETURN_VALUE_OBJ;
    }

    public inspect(): string {
        return this.value === null ? "null" : this.value.inspect();
    }
}

export class ErrorObj implements ValueObject {
    public message: string;

    constructor(message: string) {
        this.message = message;
    }

    public type(): ObjectTypeItem {
        return ObjectType.ERROR_OBJ;
    }

    public inspect(): string {
        return `ERROR: ${this.message}`;
    }
}

export class FunctionObj implements ValueObject {
    public parameters: Identifier[];
    public body: BlockStatement | null;
    public environment: Environment;

    constructor(
        parameters: Identifier[] | null,
        body: BlockStatement | null,
        environment: Environment,
    ) {
        this.parameters = parameters ?? [];
        this.body = body;
        this.environment = environment;
    }

    public type(): ObjectTypeItem {
        return ObjectType.FUNCTION_OBJ;
    }

    public inspect(): string {
        return `fn(${this.parameters
            .map((parameter) => parameter.string())
            .join(", ")}) {
${this.body?.string()}
}`;
    }
}

type BuiltinFunction = (...args: Array<ValueObject | null>) => ValueObject;

export class Builtin implements ValueObject {
    public fn: BuiltinFunction;

    constructor(fn: BuiltinFunction) {
        this.fn = fn;
    }

    public type(): ObjectTypeItem {
        return ObjectType.BUILTIN_OBJ;
    }

    public inspect(): string {
        return "builtin function";
    }
}

export class ArrayObj implements ValueObject {
    public elements: ValueObject[];

    constructor(elements: ValueObject[] = []) {
        this.elements = elements;
    }

    public type(): ObjectTypeItem {
        return ObjectType.ARRAY_OBJ;
    }

    public inspect(): string {
        return `[${this.elements
            .map((element) => element.inspect())
            .join(", ")}]`;
    }
}
