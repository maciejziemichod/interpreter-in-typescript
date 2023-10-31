import { ValueObject } from "./object";

export class Environment {
    private store: { [key: string]: ValueObject | null } = {};
    private outer: Environment | null;

    constructor(outer: Environment | null = null) {
        this.outer = outer;
    }

    public get(key: string): ValueObject | null | undefined {
        const value = this.store[key];

        if (value === undefined && this.outer !== null) {
            return this.outer.get(key);
        }

        return value;
    }

    public set(key: string, value: ValueObject | null): ValueObject | null {
        this.store[key] = value;

        return value;
    }
}
