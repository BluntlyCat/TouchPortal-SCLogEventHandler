import {BaseEventHandler} from "./BaseEvent";
import {Client} from "touchportal-api";
import {SC_KILL_REGEX} from "../constants";
import {History} from "./History";

const noKillMsg = 'No kill detected';

export class KillEvent extends BaseEventHandler {
    private killEvents: History[] = [];

    private eventIndex = 0;

    constructor(tpClient: Client) {
        super(tpClient);
    }

    public get hasKillEvents(): boolean {
        return this.killEvents.length > 0;
    }

    public clearHistory(): void {
        this.killEvents = [];
        this.eventIndex = 0;
    }

    public handleEvent(line: string) {
        this.tpClient.logIt("DEBUG", "Handle kill event");
        const killMatch = SC_KILL_REGEX.exec(line);
        let killMsg = noKillMsg;

        if (killMatch && killMatch.groups) {
            const groups = killMatch.groups;
            const timeStr = groups['timestamp'] || '';
            const time = new Date(timeStr).toLocaleString();
            const victim = groups['npc'] ? this.formatNpcName(groups['npc']) : groups['player'];
            //const zone =  groups[3];
            const killer = groups['killer'];
            const dmgType = groups['dmgType'];

            killMsg = `${victim} was killed by ${killer}\nWhen:\t${time}\nCause:\t${dmgType}`;

            this.killEvents.push(new History(killMsg, line));
            this.eventIndex = this.killEvents.length - 1;
            this.tpClient.logIt("DEBUG", "Kill event pushed into array", this.killEvents.length);
        }

        this.tpClient.stateUpdate('sc_leh_kill_state', this.getEventMessage(killMsg));
        this.tpClient.stateUpdate('sc_leh_kill_state_full', line);
    }

    public nextMessage() {
        this.tpClient.logIt("DEBUG", "Current Index", this.eventIndex);
        this.eventIndex = (this.eventIndex + 1) % this.killEvents.length;
        this.tpClient.logIt("DEBUG", "New Index", this.eventIndex);
        this.updateStates();
    }

    public previousMessage() {
        this.tpClient.logIt("DEBUG", "Current Index", this.eventIndex);
        this.eventIndex = (this.eventIndex - 1) % this.killEvents.length;
        this.tpClient.logIt("DEBUG", "New Index", this.eventIndex);
        this.updateStates();
    }

    private updateStates() {
        this.tpClient.stateUpdate('sc_leh_kill_state', this.getEventMessage(this.killEvents[this.eventIndex].message));
        this.tpClient.stateUpdate('sc_leh_kill_state_full', this.killEvents[this.eventIndex].fullLine);
    }

    private formatNpcName = (rawName: string) => {
        return rawName
            .split('_')
            .map(s => `${s.charAt(0).toUpperCase()}${s.slice(1)}`)
            .join(' ')
            .trim();
    }

    private getEventMessage(killMsg: string) {
        return `Event ${this.eventIndex + 1}/${this.killEvents.length}:\t${killMsg}`;
    }
}