/*
 * This file includes code from Jameson Allen
 */
module.exports = {
    pluginId: 'TP_SC-LFE',
    scRootPath: 'Star Citizen Root Directory',
    scEnvironment: 'Star Citizen Environment',
    scGameLogFile: 'Star Citizen Game Log File',
    updateUrl: 'https://raw.githubusercontent.com/bluntlycat/TouchPortal-SC-Log-Event-Handler/main/package.json',
    releaseUrl: 'https://github.com/bluntlycat/TouchPortal-SC-Log-Event-Handler/releases',
    scKillRegex: /^<(\d+-\d+-\d+T\d+:\d+:\d+.\d+Z)>.+Actor Death.+killed by '(\w+)' .+with damage type '(\w+)'.+$/
}