/*
 * This file includes code from Jameson Allen
 */
module.exports = {
    pluginId: 'TP_SC-LFE',
    scRootPath: 'Star Citizen Root Directory',
    scEnvironment: 'Star Citizen Environment',
    scGameLogFile: 'Star Citizen Game Log File',
    scReadLogInterval: 'Star Citizen Read Interval',
    scTotalMoney: 'Star Citizen Total Money',
    scSquadMoney: 'Star Citizen Squad Money',
    scPersonalMoney: 'Star Citizen Personal Money',
    updateUrl: 'https://raw.githubusercontent.com/BluntlyCat/TouchPortal-SCLogEventHandler/main/package.json',
    releaseUrl: 'https://raw.githubusercontent.com/BluntlyCat/TouchPortal-SCLogEventHandler/releases',
    scKillRegex: /^<(\d+-\d+-\d+T\d+:\d+:\d+.\d+Z)>.+Actor Death.+killed by '(\w+)' .+with damage type '(\w+)'.+$/
}