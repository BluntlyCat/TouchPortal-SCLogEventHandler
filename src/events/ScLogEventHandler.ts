import {Client} from "touchportal-api";
import {BaseEventHandler} from "./BaseEvent";
import {EventTypes} from "./EventTypes";
import {HelmetEvent} from "./HelmetEvent";
import {KillEvent} from "./KillEvent";

export class ScLogEventHandler {
    tpClient: Client;

    private readonly _eventHandlers: Record<EventTypes, BaseEventHandler>;

    constructor(tpClient: Client) {
        this.tpClient = tpClient;

        this._eventHandlers = {
            helmet: new HelmetEvent(this.tpClient),
            kill: new KillEvent(this.tpClient)
        };
    }

    get eventHandlers() {
        return this._eventHandlers;
    }
}