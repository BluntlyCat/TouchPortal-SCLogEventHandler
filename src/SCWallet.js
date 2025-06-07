const Constants = require('./consts');

module.exports = class SCWallet {
    tpClient = null;
    pluginId = '';

    scTotalMoney = 0;
    scSquadMoney = 0;
    scPersonalMoney = 0;


    constructor(tpClient, pluginId, scTotalMoney, scSquadMoney, scPersonalMoney) {
        this.tpClient = tpClient;
        this.pluginId = pluginId;

        this.scTotalMoney = +scTotalMoney;
        this.scSquadMoney = +scSquadMoney;
        this.scPersonalMoney = +scPersonalMoney;
    }

    setTotalScMoney(totalScMoney) {
        this.totalScMoney = +totalScMoney;
    }

    setSquadMoney(squadMoney) {
        this.scSquadMoney = +squadMoney;
    }

    setPersonalMoney(personalMoney) {
        this.scPersonalMoney = +personalMoney;
    }

    setNewWalletValue = (value, wallet) => {
        value = +value;

        if (value < 0) {
            this.tpClient.sendNotification(
                `${this.pluginId}_invalid_value`,
                'Invalid value',
                `Value less than one`,
                [{
                    id: `${this.pluginId}_invalid_value`,
                    title: "You can not have a negative balance in Star Citizen. Accordingly, the value must be a number greater than zero"
                }]
            );
            return;
        }

        if (wallet !== 'personal' && wallet !== 'squad') {
            this.tpClient.sendNotification(
                `${this.pluginId}_invalid_wallet`,
                'Invalid wallet',
                `Unknown wallet ${wallet}`,
                [{
                    id: `${this.pluginId}_invalid_wallet`,
                    title: `The value '${wallet}' for wallet is invalid. It must either be 'personal' or 'squad'`
                }]
            );
            return;
        }

        const earning = value - this.totalScMoney;
        if (wallet === 'squad') {
            this.scSquadMoney += earning;
        }

        this.totalScMoney = value;

        this.tpClient.stateUpdate('sc_leh_total_money', this.totalScMoney);
        this.tpClient.settingUpdate(Constants.scTotalMoney, this.totalScMoney);

        this.tpClient.stateUpdate('sc_leh_squad_money', this.scSquadMoney);
        this.tpClient.settingUpdate(Constants.scSquadMoney, this.scSquadMoney);
    }
}