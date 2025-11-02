import {BaseEventHandler} from "./BaseEvent";
import {Client} from "touchportal-api";

export class HelmetEvent extends BaseEventHandler {
    constructor(tpClient: Client) {
        super(tpClient);
    }

    public handleEvent(line: string): void {
        let helmetState = 'off';
        if (line.includes('EquipItem')) {
            helmetState = 'on';
        } else if (line.includes('StoreItem')) {
            helmetState = 'off';
        } else if (line.includes('Armor_Helmet')) {
            helmetState = 'on';
        } else if (line.includes('helmethook_attach')) {
            helmetState = 'off';
        }

        this.tpClient.stateUpdate('sc_leh_helmet_state', helmetState);
    }
}