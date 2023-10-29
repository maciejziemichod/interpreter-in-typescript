export const ObjectType = {
    INTEGER_OBJ: "INTEGER",
    BOOLEAN_OBJ: "BOOLEAN",
    NULL_OBJ: "NULL",
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
