/*
 * This file includes code from Jameson Allen
 */
const AdmZip = require("adm-zip");
const path = require("path");
const fs = require("fs");
const pkg = require("pkg");
const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf8"))

const build = async (platform) => {
    fs.mkdirSync(`./base/${platform}`)
    fs.copyFileSync("./base/entry.tp", `./base/${platform}/entry.tp`)
    fs.copyFileSync("./base/plugin_icon.png", `./base/${platform}/${packageJson.name}.png`)

    let nodeVersion = 'node18-win-x64'
    let realExecName = `${packageJson.name}_real.exe`
    let execName = `${packageJson.name}.exe`

    if (platform !== "Windows") {
        realExecName = packageJson.name
        execName = packageJson.name
    }

    if (platform === "MacOS") {
        nodeVersion = 'node20-macos-x64'

    }
    if (platform === "MacOS-Arm64") {
        nodeVersion = 'node20-macos-arm64'
    }
    if (platform === "Linux") {
        nodeVersion = 'node20-linux-x64'
    }

    const icuDat = 'icudt71l.dat'
    const src = path.resolve(`./base/${icuDat}`);
    const dstDir = path.resolve(`./base/${platform}/icu`);
    fs.mkdirSync(dstDir, { recursive: true });
    fs.copyFileSync(src, path.join(dstDir, icuDat));
    console.log('ICU copied to', dstDir);

    fs.copyFileSync('./package.json', `./base/${platform}/package.json`);

    console.log("Running pkg")
    await pkg.exec([
        "--targets",
        nodeVersion,
        "--output",
        `base/${platform}/${realExecName}`,
        'bootstrap.cjs',
    ]);

    await pkg.exec([
        '--targets', nodeVersion,
        '--output', `base/${platform}/${execName}`,  // <- DAS ist die EXE, die TP startet
        'launcher.cjs',
    ]);

    console.log("Running Zip File Creation")
    const zip = new AdmZip()
    zip.addLocalFolder(
        path.normalize(`./base/${platform}/`),
        packageJson.name
    );

    zip.writeZip(path.normalize(`./Installers/${packageJson.name}-${platform}-${packageJson.version}.tpp`), undefined);

    console.log("Cleaning Up")
    fs.unlinkSync(`./base/${platform}/entry.tp`)
    fs.unlinkSync(`./base/${platform}/${packageJson.name}.png`)
    fs.unlinkSync(`./base/${platform}/${realExecName}`)
    fs.unlinkSync(`./base/${platform}/${execName}`)
    fs.unlinkSync(`./base/${platform}/package.json`)
    fs.rmdirSync(`./base/${platform}/icu`, { recursive: true });
    fs.rmdirSync(`./base/${platform}`)
}

const cleanInstallers = () => {
    try {
        dirPath = './Installers/'
        // Read the directory given in `path`
        fs.readdir(dirPath, (err, files) => {
            if (err)
                throw err;

            files.forEach((file) => {
                // Check if the file is with a PDF extension, remove it
                if (file.split('.').pop().toLowerCase() === 'tpp') {
                    console.log(`Deleting file: ${file}`);
                    fs.unlinkSync(dirPath + file)
                }
            });
        });
    } catch (err) {
        console.error(err);
    }
}

const executeBuilds = async () => {
    cleanInstallers()
    await build("Windows")
    //await build("MacOS")
    //await build("Linux")
}

void executeBuilds();