const { Client, Authenticator } = require('minecraft-launcher-core')
const { Auth } = require("msmc")
const { exec } = require('child_process');
const { rmSync, existsSync, createWriteStream, mkdirSync, createReadStream, renameSync, readSync, readdirSync, writeFileSync, rmdirSync } = require('fs')
const path = require("path")
const axios = require("axios")
const { x } = require('tar');
const { createGunzip } = require('zlib');
const { homedir, platform, arch, totalmem } = require('os')
const AdmZip = require('adm-zip');
const { parseString } = require('xml2js')
const { app, BrowserWindow, ipcMain, nativeImage, dialog } = require('electron');

function download(url, destination) {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await axios({
                method: 'get',
                url: url,
                responseType: 'stream',
            });
            const fileStream = createWriteStream(destination);
            response.data.pipe(fileStream);
            resolve(new Promise((resolve, reject) => {
                fileStream.on('finish', () => {
                    resolve(destination)
                });

                fileStream.on('error', err => {
                    console.error('Erreur lors du téléchargement du fichier :', err);
                    reject(err);
                });
            }));
        } catch (error) {
            console.error('Erreur lors de la requête HTTP :', error);
            reject(error)
        }
    })

}

async function installJre(useplatform = platform(), usearch = arch()) {
    const fractaHome = process.env.fractaHome || getFractaHome()
    let link = ""
    console.log(`install java 1.17 os:${useplatform} arch:${usearch}`)
    try {
        const jrefile = require("./jre.json")
        link = jrefile[useplatform][usearch]
    } catch (err) { }
    if (link == undefined) return
    if (existsSync(`${fractaHome}/jre`)) { rmSync(path.join(fractaHome, "jre"), { recursive: true }) }
    mkdirSync(`${fractaHome}/download`, { recursive: true })
    if (link.includes(".zip")) {
        await download(link, `${fractaHome}/download/jre.zip`).catch((e) => {
            dialog.showErrorBox("Jre install error", e)
        })
        const zip = new AdmZip(`${fractaHome}/download/jre.zip`)
        await zip.extractAllTo(`${fractaHome}/download/jre`)
        renameSync(`${fractaHome}/download/jre/${readdirSync(`${fractaHome}/download/jre`)[0]}`, `${fractaHome}/jre`)
        rmSync(`${fractaHome}/download/jre.zip`)
        console.log("java install finish")
        return `${fractaHome}/jre`
    } else {
        await download(link, `${fractaHome}/download/jre.tar.gz`).catch((e) => {
            dialog.showErrorBox("Jre install error", e)
        })
        mkdirSync(`${fractaHome}/download/jre`, { recursive: true })
        return new Promise((resolve, reject) => {
            const targz = createReadStream(`${fractaHome}/download/jre.tar.gz`)
                .pipe(createGunzip())
                .pipe(x({
                    C: `${fractaHome}/download/jre`
                }))
            targz.once("finish", (e) => {
                renameSync(`${fractaHome}/download/jre/${readdirSync(`${fractaHome}/download/jre`)[0]}`, `${fractaHome}/jre`)
                rmSync(`${fractaHome}/download/jre.tar.gz`)
                console.log("java install finish")
                resolve(`${fractaHome}/jre`)
            })
        })
    }

}

function getJrePath(useplatform = platform()) {
    const fractaHome = process.env.fractaHome || getFractaHome()
    switch (useplatform) {
        case "linux":
            return path.join(fractaHome, "jre", "bin", "java")
        case 'aix':
            return path.join(fractaHome, "jre", "bin", "java")
        case 'darwin':
            return path.join(fractaHome, "jre", "Contents", "Home", "java")
        case 'win32':
            return path.join(fractaHome, "jre", "bin", "java.exe")
        default:
            return undefined
    }
}

function octets(octets) {
    if (octets < 1024) {
        return octets + " octets";
    } else if (octets < 1024 * 1024) {
        return (octets / 1024).toFixed(2) + " Ko";
    } else if (octets < 1024 * 1024 * 1024) {
        return (octets / (1024 * 1024)).toFixed(2) + " Mo";
    } else {
        return (octets / (1024 * 1024 * 1024)).toFixed(2) + " Go";
    }
}

function getFractaHome() {
    const home = homedir()
    switch (platform()) {
        case 'darwin': console.log("Darwin platform(MacOS, IOS etc)");
            process.env.fractaHome = path.join(home, 'Library', 'Application Support', '.fractalium');
            break;
        case 'linux': console.log("Linux Platform");
            process.env.fractaHome = path.join(home, '.local', 'share', '.fractalium')
            break;
        case 'win32': console.log("windows platform");
            process.env.fractaHome = path.join(home, 'AppData', 'Roaming', '.fractalium')
            break;
        default: console.error("unknown platform");
            process.exit(5)
    }
    return process.env.fractaHome
}

function getVersionConfig(version) {
    let configer = getVersionsJson()
    version.split("-").forEach((e) => {
        configer = configer[e]
    })
    return configer
}

class Instance {
    client = new Client()
    opt = {}
    version = {}
    config = {}
    fractaHome = process.env.fractaHome || getFractaHome()
    JrePath = getJrePath()
    constructor(name, version, config = getConfigJson()) {
        this.opt = {
            root: this.fractaHome,
            cache: `${this.fractaHome}/cache`,
            memory: config.ram,
            javaPath: getJrePath(),
            overrides: {
                gameDirectory: `${this.fractaHome}/gameDirectory/${name}`
            },
        }
        if (typeof config.auth === "object" && config.auth !== null) {
            if (Authenticator.validate(config.auth.access_token, config.auth.client_token)) {
                this.opt.authorization = config.auth
            } else {
                this.opt.authorization = Authenticator.refreshAuth(config.auth.access_token, config.auth.client_token)
            }
        } else {
            this.opt.authorization = Authenticator.getAuth(config.auth)
        }
        this.version = version
        this.config = config
    }
    async setversion(version = this.version) {
        this.opt.version = version.mcversion
        switch (version.method) {
            case "vanilla":
                break
            case "forge":
                if (!existsSync(`${this.fractaHome}/download/${version.modloader.name}/${version.modloader.version}.jar`)) {
                    mkdirSync(`${this.fractaHome}/download/${version.modloader.name}`, { recursive: true })
                    await download(version.link, `${this.fractaHome}/download/${version.modloader.name}/${version.modloader.version}.jar`)
                }
                this.opt.forge = `${this.fractaHome}/download/${version.modloader.name}/${version.modloader.version}.jar`
                this.opt.version.custom = `${version.modloader.name}-${version.modloader.version}`
                break
            case "CMD":
                if (!existsSync(`${this.fractaHome}/download/${version.modloader.name}-installer.jar`)) {
                    mkdirSync(`${this.fractaHome}/download`, { recursive: true })
                    const versionfile = getVersionsJson()
                    await download(versionfile[version.modloader.name].installer, `${this.fractaHome}/download/${version.type}-installer.jar`)
                }
                switch (version.type) {
                    case "fabric":
                        if (!existsSync(`${this.fractaHome}/versions/fabric-loader-${version.modloader.version}-${version.mcversion.number}/fabric-loader-${version.modloader.version}-${version.mcversion.number}.jar`)) {
                            await new Promise((resolve, reject) => {
                                exec(
                                    `"${this.JrePath}" -jar ${this.fractaHome}/download/${version.modloader.name}-installer.jar client -dir "${this.fractaHome}" -noprofile -downloadMinecraft -loader "${version.modloader.version}" -mcversion "${version.mcversion.number}"`,
                                    (error, stdout, stderr) => {
                                        if (error) {
                                            console.error(`Erreur d'exécution : ${error}`)
                                            return
                                        }
                                        console.log(`Sortie standard : ${stdout}`)
                                        if (!undefined == stderr) {
                                            console.error(`Sortie d'erreur : ${stderr}`)
                                        }
                                    }).once("close", (e) => {
                                        resolve()
                                    })
                            })
                            rmSync(`${this.fractaHome}/versions/fabric-loader-${version.modloader.version}-${version.mcversion.number}/fabric-loader-${version.modloader.version}-${version.mcversion.number}.jar`)
                        }
                        this.opt.version.custom = `fabric-loader-${version.modloader.version}-${version.mcversion.number}`
                        break
                    default:
                        this.opt.version.custom = version.modloader.custom
                        if (!existsSync(path.join(this.fractaHome, "version", version.modloader.custom, `${version.modloader.custom}.json`))) {
                            await new Promise((resolve, reject) => {
                                exec(
                                    `"${this.JrePath}" -jar ${this.fractaHome}/download/${version.modloader.name}-installer.jar ${version.command}`,
                                    (error, stdout, stderr) => {
                                        if (error) {
                                            console.error(`Erreur d'exécution : ${error}`)
                                            return
                                        }
                                        console.log(`Sortie standard : ${stdout}`)
                                        if (!undefined == stderr) {
                                            console.error(`Sortie d'erreur : ${stderr}`)
                                        }
                                    }).once("close", (e) => {
                                        resolve()
                                    })
                            })
                        }
                        break
                }
                break
            default:
                this.opt.version.custom = version.modloader.custom
                break
        }
        let namemodloader
        let versionmodloader
        try {
            namemodloader = version.modloader.name
            versionmodloader = version.modloader.version
        } catch (error) {
            namemodloader = version.method
        }
        console.log(`[version install] : minecraft:${version.mcversion.number} ${namemodloader}:${versionmodloader || ""}`)
    }
    addAutoOn(logger) {
        this.client.on('download-status', (e) => {
            const p = (e.current * 100) / e.total
            const tt = `[download]:${e.name} <br>${octets(e.current)}/${octets(e.total)} <br>[${p.toFixed(1)}]`
            console.log(tt.replace(/\<br\>/g, ""))
            if (logger != undefined) {
                logger.send(tt)
            }
        })
        this.client.on('debug', (e) => {
            console.log(e)
            if (logger != undefined) {
                logger.send(e)
            }
        })
        this.client.on('data', (e) => {
            console.log(e)
            if (e.includes("Setting user:")) {
                logger.win.setClosable(true)
                logger.win.close()
            }
        })
        this.client.once('arguments', (e) => {
            console.log(("Launching"))
            if (logger != undefined) {
                logger.send("Launching")
            }
        })
    }
    async defaultLanch(opt = this.opt, version = this.version, autoon = undefined) {
        await this.setversion(version)
        this.addAutoOn(autoon)
        return this.launch(opt)
    }
    async launch(opt = this.opt) {
        if (opt.version == undefined) {
            await this.setversion()
        }
        return this.client.launch(opt)
    }
}

class loaderLaunch {
    win
    constructor() {
        BrowserWindow.getAllWindows().forEach((e) => {
            e.hide()
        })
        this.win = new BrowserWindow({
            width: 800,
            height: 600,
            autoHideMenuBar: true,
            transparent: true,
            frame: false,
            movable: false,
            resizable: false,
            closable: false,
            show: false,
            icon: "./asset/image/mono 256.png",
            title: "Starting MC",
            webPreferences: {
                preload: path.join(__dirname, "startMc", 'startMc.js'),
                devTools: false,
            }
        })

        this.win.loadFile('./startMC/startMc.html').then(() => {
            this.win.show()
            this.win.focus()
        })

    }
    send(message) {
        this.win.webContents.send("load", message)
    }
    waitload() {
        return new Promise((resolve, reject) => {
            ipcMain.once("loaded", () => {
                resolve()
            })
        })
    }
}

async function generateVersionsObject() {
    let allversion = {}
    // vanilla
    try {
        const vanilla = await axios({
            method: 'get',
            url: "https://piston-meta.mojang.com/mc/game/version_manifest.json",
            responseType: 'json',
        })
        vanilla.data.versions.forEach((e) => {
            if (!allversion.vanilla) allversion.vanilla = {}
            allversion.vanilla[e.id] = {
                "method": "vanilla",
                "mcversion": {
                    "number": e.id,
                    "type": e.type
                }
            }
        })
    } catch (error) {
        console.error('Erreur lors de vanilla :', error);
    }
    // forge
    try {
        function mcvers(links) {
            let forge = {}
            links.forEach((link) => {
                const split = link.split('/')
                const filename = split[split.length - 1]
                const splitfilename = filename.split("-")
                const forgever = splitfilename[2]
                const mcver = splitfilename[1]
                if (!forge[mcver]) forge[mcver] = {}
                forge[mcver][forgever] = {
                    method: "forge",
                    link: link,
                    mcversion: {
                        number: mcver,
                        type: "release"
                    },
                    modloader: {
                        name: "forge",
                        version: forgever
                    }
                }
            })
            return forge
        }
        const forge = await axios({
            method: 'get',
            url: "https://files.minecraftforge.net/net/minecraftforge/forge/",
        })
        const mcversion = forge.data.match(/<a\s+href="index_([^"]+\.html)">[^<]+<\/a>/g)
        let version = []
        let links = []
        let promisesvers = []
        const filted = forge.data.match(/<a\W*href="[^"]*">\(Direct Download\)<\/a>/g).filter((e) => e.includes("installer.jar") || e.includes("universal.jar"))
        filted.forEach((e) => {
            links.push(e.split('"')[1])
        })
        mcversion.forEach((e) => {
            promisesvers.push(new Promise(async (resolve, reject) => {
                const index = await axios({
                    method: 'get',
                    url: `https://files.minecraftforge.net/net/minecraftforge/forge/${e.split('"')[1]}`,
                })
                index.data.match(/<a\W*href="[^"]*">\(Direct Download\)<\/a>/g).filter((e) => e.includes("installer.jar") || e.includes("universal.jar")).forEach((link) => {
                    links.push(link.split('"')[1])
                })
                resolve()
            }))
        })
        await Promise.all(promisesvers).then(() => {
            allversion.forge = mcvers(links)
        })
    } catch (error) {
        console.error('Erreur lors de forge :', error);
    }
    // neoforge
    try {
        const neoforge = await axios({
            method: 'get',
            url: "https://maven.neoforged.net/api/maven/versions/releases/net/neoforged/neoforge",
            responseType: 'json',
        })
        neoforge.data.versions.forEach((e) => {
            const mcver = `1.${e.slice(0, e.indexOf(".", e.indexOf(".") + 1))}`
            const neover = e.slice(e.indexOf(".", e.indexOf(".") + 1) + 1)
            if (!allversion.neoforge) allversion.neoforge = {}
            if (!allversion.neoforge[mcver]) allversion.neoforge[mcver] = {}
            if (!allversion.neoforge[mcver][neover]) allversion.neoforge[mcver][neover] = {}
            allversion.neoforge[mcver][neover] = {
                "method": "forge",
                "link": `https://maven.neoforged.net/releases/net/neoforged/neoforge/${e}/neoforge-${e}-installer.jar`,
                "mcversion": {
                    "number": mcver,
                    "type": "release"
                },
                "modloader": {
                    "name": "neoforge",
                    "version": neover
                }
            }
        })

    } catch (error) {
        console.error('Erreur lors de neoforge :', error);
    }
    // fabric
    try {
        const fabricloader = await axios({
            method: 'get',
            url: 'https://maven.fabricmc.net/net/fabricmc/fabric-loader/maven-metadata.xml',
            responseType: 'text'
        })
        const fabricloaderdata = await new Promise((resolve, reject) => {
            parseString(fabricloader.data, (err, result) => {
                resolve(result.metadata.versioning[0].versions[0].version)
            })
        })
        const fabricmc = await axios({
            method: 'get',
            url: 'https://maven.fabricmc.net/net/fabricmc/intermediary/maven-metadata.xml',
            responseType: 'text'
        })
        const fabricmcdata = await new Promise((resolve, reject) => {
            parseString(fabricmc.data, (err, result) => {
                resolve(result.metadata.versioning[0].versions[0].version)
            })
        })
        fabricmcdata.forEach((e) => {
            if (!allversion.fabric) allversion.fabric = {}
            if (!allversion.fabric[e]) allversion.fabric[e] = {}
            fabricloaderdata.forEach((f) => {
                try {
                    allversion.fabric[e][f] = {
                        "method": "CMD",
                        "type": "fabric",
                        "mcversion": {
                            "number": e,
                            "type": allversion.vanilla[e].mcversion.type
                        },
                        "modloader": {
                            "name": "fabric",
                            "version": f
                        }
                    }
                } catch (error) {
                    console.error(`error with fabric ${e} ${f} continue... error : ${error}`)
                }

            })
        })
        Object.entries(allversion.fabric).forEach((e) => {
            if (Object.keys(e[1]).length == 0) {
                delete allversion.fabric[e[0]]
            }
        })
        const installer = await axios({
            method: 'get',
            url: 'https://maven.fabricmc.net/net/fabricmc/fabric-installer/maven-metadata.xml',
            responseType: 'text'
        })
        parseString(installer.data, (err, result) => {
            allversion.fabric.installer = `https://maven.fabricmc.net/net/fabricmc/fabric-installer/${result.metadata.versioning[0].latest[0]}/fabric-installer-${result.metadata.versioning[0].latest[0]}.jar`
        })
    } catch (error) {
        console.error('Erreur lors de fabric :', error);
    }
    return allversion
}

async function createVersionsJson(reset = false) {
    let version = {}
    const versionfile = getVersionsJson()
    if (!reset && versionfile) {
        version = versionfile
    }
    Object.assign(version, await generateVersionsObject())
    const fractaHome = process.env.fractaHome || getFractaHome()
    writeFileSync(path.join(fractaHome, "versions.json"), JSON.stringify(version))
    console.log("Version.json create")
    return version
}

function getVersionsJson(autoGenerate = true) {
    const fractaHome = process.env.fractaHome || getFractaHome()
    try {
        return require(path.join(fractaHome, "versions.json"))
    } catch (error) {
        if (!autoGenerate) return
        return createVersionsJson(true)
    }
}

function getConfigJson() {
    const fractaHome = process.env.fractaHome || getFractaHome()
    try {
        return require(path.join(fractaHome, "config.json"))
    } catch (error) {
        const defaultconfig = {
            ram: {
                min: "1G",
                max: "1G"
            }
        }
        writeFileSync(path.join(fractaHome, "config.json"), JSON.stringify(defaultconfig))
        return false
    }
}

function auth(parent) {
    return new Promise(async (resolve, reject) => {
        let xboxManager
        const icon = nativeImage.createFromPath(path.join("../", "asset", "image", "check.png")).resize({ height: 32, width: 32 })
        const authManager = new Auth("select_account")
        const opt = {
            icon: icon
        }
        if (parent) {
            opt.parent = parent
            opt.modal = true
        }
        xboxManager = await authManager.launch("electron", opt)
        resolve((await xboxManager.getMinecraft()).mclc(true))
    })
}

function crack(winparent) {
    return new Promise((resolve, reject) => {
        const fractaHome = process.env.fractaHome || getFractaHome()
        const basewin = winparent
        const win = new BrowserWindow({
            parent: basewin,
            modal: true,
            frame: false,
            height:122,
            width:254,
            // resizable:false,
            webPreferences: {
                preload: path.join(__dirname, "auth", "preauth.js")
            }
        })
        win.loadFile(path.join(__dirname, "auth", "auth.html"))
        win.webContents.openDevTools()
        ipcMain.handleOnce("auth:finish", (event, name) => {
            const config = getConfigJson()
            config.auth = name
            writeFileSync(path.join(fractaHome, "config.json"), JSON.stringify(config))
            win.close()
            resolve(name)
        })
    })

}

function firstLaunch() {
    return new Promise(async (resolve, reject) => {
        const fractaHome = process.env.fractaHome || getFractaHome()
        const win = new BrowserWindow({
            width: 877,
            height: 644,
            minWidth: 877,
            minHeight: 644,
            icon: nativeImage.createFromPath(path.join(__dirname, 'asset', "image", 'mono 256.png')),
            title: "Fractalium loading...",
            webPreferences: {
                preload: path.join(__dirname, "first_launch", "pre_first_launch.js")
            }
        })
        win.loadFile(path.join(__dirname, "first_launch", "first_launch.html"))
        ipcMain.handle("Firstlaunch:ram", () => {
            return totalmem()
        })
        await new Promise((resolve, reject) => {
            win.webContents.addListener("dom-ready", resolve)
        })
        await createVersionsJson()
        await installJre()
        // await new Promise((resolve, reject) => {
        //     setTimeout(resolve, 20000)
        // })
        win.webContents.send("Firstlaunch:finishinstall")
        const authuser = new Promise((resolve, reject) => {
            ipcMain.handleOnce("Firstlaunch:auth", async (event, type) => {
                if (type == "prenium") {
                    const user = await auth(win)
                    const config = getConfigJson()
                    config.auth = user
                    writeFileSync(path.join(fractaHome, "config.json"), JSON.stringify(config))
                    resolve(user.name)
                    return user.name
                } else {
                    const user = await crack(win)
                    resolve(user)
                    return user
                }
            })
        })
        await authuser
        await new Promise((resolve, reject) => {
            ipcMain.handleOnce('Firstlaunch:mcram', (params, ram) => {
                const config = getConfigJson()
                config.ram = ram
                writeFileSync(path.join(fractaHome, "config.json"), JSON.stringify(config))
                resolve()
            })
        })
        ipcMain.handleOnce("Firstlaunch:stop", () => {
            win.close()
            resolve()
        })
    })

}

module.exports = {
    getVersionsJson,
    Instance,
    installJre,
    getVersionConfig,
    loaderLaunch,
    download,
    auth,
    getConfigJson,
    createVersionsJson,
    firstLaunch,
    installJre,
    crack
}