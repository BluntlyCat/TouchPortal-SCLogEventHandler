import {BaseEventHandler} from "./BaseEvent";
import {Client} from "touchportal-api";
import {SC_KILL_REGEX} from "../constants";

export class KillEvent extends BaseEventHandler {
    private killEvents: { events: string[], logs: string[] } = {
        events: [],
        logs: [],
    };

    private eventIndex = 0;

    constructor(tpClient: Client) {
        super(tpClient);
    }

    public handleEvent(line: string) {
        this.tpClient.logIt("DEBUG", "Handle kill event");
        const killMatch = SC_KILL_REGEX.exec(line);
        let killMsg = 'No kill detected';

        console.log("KILLMATCH", killMatch, line);
        if (killMatch && killMatch.groups) {
            console.log(killMatch);
            const groups = killMatch.groups;
            const timeStr = groups['timestamp'] || '';
            const time = new Date(timeStr).toLocaleString();
            const victim =  groups['npc'] ? this.formatNpcName(groups['npc']) : groups['player'];
            //const zone =  groups[3];
            const killer =  groups['killer'];
            const dmgType = groups['dmgType'];

            killMsg = `Event:\t${victim} was killed by ${killer}\nWhen:\t${time}\nCause:\t${dmgType}`;
        }

        this.killEvents.events.push(killMsg);
        this.killEvents.logs.push(line);

        this.tpClient.stateUpdate('sc_leh_kill_state', killMsg);
        this.tpClient.stateUpdate('sc_leh_kill_state_full', line);
        this.tpClient.stateUpdate('sc_leh_kill_state_index', this.killEvents.events.length);
    }

    public nextMessage = () => {
        this.eventIndex = (this.eventIndex + 1) % this.killEvents.logs.length;
        this.tpClient.stateUpdate('sc_leh_kill_state', this.killEvents.events[this.eventIndex]);
        this.tpClient.stateUpdate('sc_leh_kill_state_full', this.killEvents.logs[this.eventIndex]);
    }

    private formatNpcName = (rawName: string) => {
        return rawName
            .split('_')
            .map(s => `${s.charAt(0).toUpperCase()}${s.slice(1)}`)
            .join(' ')
            .trim();
    }
}