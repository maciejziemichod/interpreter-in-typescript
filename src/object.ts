export const ObjectType = {
    INTEGER_OBJ: "INTEGER",
    BOOLEAN_OBJ: "BOOLEAN",
    NULL_OBJ: "NULL",
    RETURN_VALUE_OBJ: "RETURN_VALUE",
    ERROR_OBJ: "ERROR",
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
