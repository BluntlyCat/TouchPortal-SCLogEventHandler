const { spawn } = require('node:child_process');
const path = require('node:path');
const fs   = require('node:fs');

const exeDir = path.dirname(process.execPath);
const realExe = path.join(exeDir, 'touch_portal_star_citizen_tools_real.exe');

const icuDir = path.join(exeDir, 'icu');
const dat = fs.existsSync(icuDir) ? fs.readdirSync(icuDir).find(f => /^icudt\d+l\.dat$/i.test(f)) : null;
if (!dat) {
    console.error('[Launcher] ICU .dat missing in', icuDir);
} else {
    console.log('[Launcher] Using', path.join(icuDir, dat));
}

const env = {
    ...process.env,
    NODE_ICU_DATA: icuDir,
    TZ: 'Europe/Berlin',
};

const child = spawn(realExe, process.argv.slice(2), {
    env,
    stdio: 'inherit',
    windowsHide: false,
});

child.on('exit', (code) => process.exit(code ?? 0));
child.on('error', (err) => {
    console.error('[Launcher] Failed to start:', err);
    process.exit(1);
});