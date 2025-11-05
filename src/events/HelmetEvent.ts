import {BaseEventHandler} from "./BaseEvent";
import {Client} from "touchportal-api";
import { Line } from './types';

export class HelmetEvent extends BaseEventHandler {
    constructor(tpClient: Client) {
        super(tpClient, 'helmet');
    }

    public handle(line: Line): void {
        let helmetState = 'off';
        if (line.str.includes('EquipItem')) {
            helmetState = 'on';
        } else if (line.str.includes('StoreItem')) {
            helmetState = 'off';
        } else if (line.str.includes('Armor_Helmet')) {
            helmetState = 'on';
        } else if (line.str.includes('helmethook_attach')) {
            helmetState = 'off';
        }

        this._tpClient.stateUpdate('sc_leh_helmet_state', helmetState);
    }
}