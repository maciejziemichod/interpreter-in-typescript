import { ValueObject } from "./object";

export class Environment {
    private store: { [key: string]: ValueObject | null } = {};

    public get(key: string): ValueObject | null | undefined {
        return this.store[key];
    }

    public set(key: string, value: ValueObject | null): void {
        this.store[key] = value;
    }
}
