const Constants = require('./consts');

module.exports = class ScLogEventHandler {
    tpClient = null;

    eventHandlers = {
        helmet: (line) => {
            this.tpClient.logIt("DEBUG", "Handle helmet event");
            this.handleHelmetEvent(line);
        },
        kill: (line) => {
            this.tpClient.logIt("DEBUG", "Handle kill event");
            this.handleKillEvent(line);
        }
    };

    constructor(tpClient) {
        this.tpClient = tpClient;
    }

    handleHelmetEvent = (line) => {
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

    formatNpcName = (rawName) => {
        return rawName
            .split('_')
            .map(s => `${s.charAt(0).toUpperCase()}${s.slice(1)}`)
            .join(' ')
            .trim();
    }

    handleKillEvent = (line) => {
        const killMatch = Constants.scKillRegex.exec(line);
        let killMsg = 'No kill detected';

        if (killMatch && killMatch.groups) {
            console.log(killMatch);
            const groups = killMatch.groups;
            const timeStr = groups['timestamp'];
            const time = new Date(timeStr).toLocaleString();
            const victim =  groups['npc'] ? this.formatNpcName(groups['npc']) : groups['player'];
            //const zone =  groups[3];
            const killer =  groups['killer'];
            const dmgType = groups['dmgType'];

            killMsg = `${victim} was killed at ${time}\nCause: ${dmgType} by ${killer}`;
        }

        this.tpClient.stateUpdate('sc_leh_kill_state', killMsg);
    }
}