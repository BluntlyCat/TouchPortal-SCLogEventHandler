const path = require('node:path');
const fs   = require('node:fs');

const exeDir = path.dirname(process.execPath);
process.chdir(exeDir);

if (process.env.PRINT_ICU === '1') {
    console.log(process.versions.icu || '');
    process.exit(0);
}

const pj = path.join(exeDir, 'package.json');
if (!fs.existsSync(pj)) {
    fs.writeFileSync(pj, JSON.stringify({ name: 'touch_portal_star_citizen_tools', version: '0.0.0' }));
}

require('./dist/index.js');