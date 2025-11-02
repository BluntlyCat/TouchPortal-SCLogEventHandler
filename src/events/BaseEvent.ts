import {Client} from "touchportal-api";

export abstract class BaseEventHandler {
    protected constructor(protected tpClient: Client) {}

    public abstract handleEvent(line: string): void;
}