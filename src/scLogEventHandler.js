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

    handleKillEvent = (line) => {
        const killMatch = Constants.scKillRegex.exec(line);
        let killMsg = 'Not yet killed by anyone';

        if (killMatch) {
            const timeStr = killMatch[1];
            const time = new Date(timeStr);
            const murderer =  killMatch[2];
            const cause = killMatch[3];

            killMsg = `Killed at ${time.toLocaleString()}\nCause: ${cause} by ${murderer}`;
        }

        this.tpClient.stateUpdate('sc_leh_kill_state', killMsg);
    }
}