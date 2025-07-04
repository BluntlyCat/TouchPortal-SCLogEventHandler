/*
 * This file includes code from Jameson Allen
 */
module.exports = {
    pluginId: 'touch_portal_star_citizen_tools',
    scRootPath: 'Star Citizen Root Directory',
    scEnvironment: 'Star Citizen Environment',
    scGameLogFile: 'Star Citizen Game Log File',
    scReadLogInterval: 'Star Citizen Read Interval',
    scTotalMoney: 'Star Citizen Total Money',
    scSquadMoney: 'Star Citizen Squad Money',
    updateUrl: 'https://raw.githubusercontent.com/BluntlyCat/TouchPortal-SCLogEventHandler/main/package.json',
    releaseUrl: 'https://raw.githubusercontent.com/BluntlyCat/TouchPortal-SCLogEventHandler/releases',
    scKillRegex: /^<(?<timestamp>\d+-\d+-\d+T\d+:\d+:\d+\.\d+Z)>.+?Actor Death.+?Kill: '(?:(PU_\w+_(?<npc>NPC(?:_\w+)+))_\d+|(?<player>[A-Za-z0-9_-]+))'.+?in zone '(?<zone>[\w_-]+)'.+?killed by '(?<killer>\w+)'.+?with damage type '(?<dmgType>\w+)'/,
}