const { app, BrowserWindow, ipcMain, dialog, Menu, nativeImage, Tray, shell, } = require('electron');
const { homedir, platform, totalmem } = require('node:os');
const path = require('node:path');
const { existsSync, readdirSync, readFileSync, rmSync, mkdir, writeFile, mkdirSync, writeFileSync, renameSync, createReadStream, readSync, readFile } = require('node:fs');
const { getVersionConfig, Instance, loaderLaunch, download, getVersionsJson, auth, getConfigJson, createVersionsJson, installJre, firstLaunch, crack, manifestModpack } = require('./launchercore');
const dotenv = require("dotenv");
const axios = require('axios');
const AdmZip = require('adm-zip');
const { check } = require('./update');

dotenv.config({
    path: path.join(__dirname, ".env")
})
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
let fractaHome = getFractaHome()
const defaulticon = "data:image/png;base64,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"
function createBaseWindow() {
    const win = new BrowserWindow({
        width: 877,
        height: 644,
        minWidth: 877,
        minHeight: 644,
        icon: nativeImage.createFromPath(path.join(__dirname, 'asset', "image", 'mono 256.png')),
        title: "Fractalium loading...",
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            devTools: !app.isPackaged
        }
    })
    win.loadFile('index.html')
    win.webContents.setWindowOpenHandler(({ url }) => {
        if (url.slice(0, 8) == "file:///") {
            return {
                action: 'allow',
                overrideBrowserWindowOptions: {
                    width: 877,
                    height: 644,
                    minWidth: 877,
                    minHeight: 644,
                    icon: "./asset/image/mono 256.png",
                    title: "Fractalium loading...",
                    autoHideMenuBar: true,
                    webPreferences: {
                        preload: path.join(__dirname, 'preload.js'),
                        devTools: !app.isPackaged,

                    },
                },
            }
        }
        return {
            action: 'allow',
            overrideBrowserWindowOptions: {
                icon: "./asset/image/mono 256.png",
                title: "Fractalium loading...",
                autoHideMenuBar: true,
                parent: BrowserWindow.getFocusedWindow()
            }
        }
    })
    let inst = []
    getInstance().forEach((e) => {
        const icon = e.config.icon
        const name = e.name
        inst.push({
            icon: nativeImage.createFromDataURL(icon).resize({ height: 16, width: 16 }),
            label: name,
            click: () => startInstance(undefined, e)
        })
    })
    const menu = Menu.buildFromTemplate([
        {
            label: "Home",
            click: () => win.webContents.loadURL(path.join(__dirname, 'index.html'))
        },
        {
            label: "Option",
            submenu: [
                {
                    label: "Authentification",
                    submenu: [
                        {
                            label: "Prenium",
                            click: (menu, winparent) => {
                                auth(winparent).then((e) => {
                                    const config = getConfigJson()
                                    config.auth = e
                                    writeFileSync(path.join(fractaHome, "config.json"), JSON.stringify(config))
                                })
                            }
                        },
                        {
                            label: "Crack",
                            click: async (menu, winparent) => {
                                crack(winparent)
                            }
                        }
                    ]
                },
                {
                    label: "Reset",
                    submenu: [
                        {
                            label: "Version.json",
                            click: async (menu) => {
                                menu.visible = false
                                await createVersionsJson()
                                menu.visible = true
                            },
                        },
                        {
                            label: "Jre",
                            click: async (menu) => {
                                menu.visible = false
                                await installJre()
                                menu.visible = true
                            }
                        }
                    ]
                }
            ]
        },
        {
            label: "Fast start",
            submenu: inst
        },
        {
            visible: !app.isPackaged,
            enabled: !app.isPackaged,
            label: "Dev",
            type: "normal",
            click: () => {
                try {
                    BrowserWindow.getFocusedWindow().webContents.openDevTools()
                } catch (err) { }
            },
        }
    ])
    win.setMenu(menu)
    return win
}
function newFractmod(event) {
    const win = BrowserWindow.fromWebContents(event.sender)
    win.webContents.setWindowOpenHandler(({ url }) => {
        return {
            action: 'allow',
            overrideBrowserWindowOptions: {
                icon: "./asset/image/mono 256.png",
                title: "Fractalium loading...",
                autoHideMenuBar: true,
                parent: win
            }
        }
    })
}
app.whenReady().then(() => {
    check()
    const config = getConfigJson()
    if (!config?.valid) {
        firstLaunch().then(() => {
            createBaseWindow()
        })
    } else {
        createBaseWindow()
    }
    ipcMain.handle('instance:getinstance', getInstance)
    ipcMain.handle('instance:launch', startInstance)
    ipcMain.handle('Fractmod:downloadMod', downloadMod)
    ipcMain.handle('instance:getversions', getVersionsJson)
    ipcMain.handle('tool:getFile', getFile)
    ipcMain.handle("Fractmod:getVersionConfig", getVersionConfigHandle)
    ipcMain.handle("Fractmod:setFractmod", newFractmod)
    ipcMain.handle("instance:newIntance", newInstance)
    ipcMain.handle("instance:openfolder", openInstanceFolder)
    ipcMain.handle('instance:delete', deleteIntance)
    ipcMain.handle('instance:import', importInstance)
    ipcMain.handle('instance:geticon', getModIcon)
    ipcMain.handle('instance:deletemod', deleteMod)
    ipcMain.handle("Fractmod:open", openFractmod)
    ipcMain.handle("app:add", addapp)
    ipcMain.handle('app:get', getAppsJson)
    ipcMain.handle("config:auth", authconfig)
    ipcMain.handle("config:getram", getRam)
    ipcMain.handle("config:setram", setRam)
    ipcMain.handle("config:changekeeplaunch", changeKeepLaunch)
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createBaseWindow()
        }
    })
    tray()
})
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
function getInstance() {
    const gameDirectory = path.join(fractaHome, "gameDirectory")
    if (!existsSync(gameDirectory)) return []
    let Instancelist = []
    readdirSync(gameDirectory, { withFileTypes: true }).forEach((e) => {
        if (e.isDirectory()) {
            try {
                Instancelist.push(new InstanceInfo(e))
            } catch (e) { }
        }
    })
    return Instancelist
}
class InstanceInfo {
    name
    path
    config
    mods = []
    constructor(e) {
        this.name = e.name
        this.path = `${e.path}\\${this.name}`
        this.config = require(`${this.path}/config.json`)
        if (!existsSync(path.join(this.path, "mods"))) return
        readdirSync(path.join(this.path, "mods"), { withFileTypes: true }).forEach((m) => {
            if (m.isFile() && m.name.slice(m.name.lastIndexOf(".")) == ".jar") {
                this.mods.push({
                    path: path.join(m.path, m.name),
                    name: m.name
                })
            }
        })
    }
    getVersion() { return getVersionConfig(this.config.version) }
}
function startInstance(event, instance) {
    return new Promise(async (resolve, reject) => {
        const mc = new Instance(instance.name, getVersionConfig(instance.config.version), instance.config.launch)
        const loader = new loaderLaunch()
        try {
            await loader.waitload()
            const pros = await mc.defaultLanch(undefined, undefined, loader)
            loader.send("Launched")
            mc.client.once("close", () => {
                BrowserWindow.getAllWindows().forEach((e) => {
                    e.show()
                })
                loader?.win?.close()
            })
            resolve(pros)
        } catch (err) {
            console.error(err)
            dialog.showErrorBox("Launch mc error", err)
        }
    })
}
function downloadMod(event, mod, instance) {
    return new Promise((resolve, reject) => {
        let fileremove = []
        if (instance.mods.some((e) => e.name.split("-")[0] == mod.fileName.split("-")[0])) {
            instance.mods.filter((e) => e.name.split("-")[0] == mod.fileName.split("-")[0]).forEach((e) => {
                rmSync(e.path)
                fileremove.push(e)
            })
        }
        download(mod.downloadUrl, path.join(instance.path, "mods", mod.fileName)).then((e) => {
            resolve({
                success: true,
                mod: {
                    path: e,
                    name: mod.fileName
                },
                remove: fileremove
            })
        }, (e) => {
            reject({
                success: false,
                reason: e,
                mod: {
                    name: mod.fileName
                }
            })
        }
        )
    })
}
function getFile(event, type) {
    return new Promise(async (resolve, reject) => {
        switch (type) {
            case "iconMod":
                const icon = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
                    title: "Select Mod Icons",
                    properties: ['openFile'],
                    filters: [
                        { name: "Mod Icon", extensions: ["png"] }
                    ]
                })
                if (icon.canceled) {
                    reject("canceled")
                } else {
                    resolve(`data:image/png;base64,${readFileSync(icon.filePaths[0]).toString("base64")}`)
                }
                break;

            default:
                break;
        }
    })
}
function getVersionConfigHandle(event, version) {
    return getVersionConfig(version)
}
function newInstance(event, Object) {
    const instancepath = path.join(fractaHome, "gameDirectory", Object.name)
    mkdirSync(path.join(instancepath, "mods"), { recursive: true })
    const configfile = {
        version: Object.version,
        nickname: Object.nickname,
        icon: Object.icon,
        decription: Object.decription
    }
    const configpath = path.join(instancepath, "config.json")
    writeFileSync(configpath, JSON.stringify(configfile))
}
function openInstanceFolder(event, instance) {
    shell.openPath(instance.path)
}
async function importInstance(event, type, opt) {
    switch (type) {
        case "url":
            const json = await axios({
                method: "get",
                url: opt,
                responseType: 'json'
            })
            const url = json.data.file
            axios({
                method: "get",
                responseType: "arraybuffer"
            }).then(async (e) => {
                const adm = new AdmZip(e.data)
                const manifest = adm.readFile("manifest.json")
                const test = manifest.toString()
            })
            break;
        case "file":
            const pathed = await dialog.showOpenDialog(BrowserWindow.fromWebContents(event.sender), {
                filters: [{
                    name: "Minecraft modpack",
                    extensions: ["zip"],
                }],
                properties: ['openFile']
            })
            if (pathed.canceled) return false
            const zip = new AdmZip(pathed.filePaths[0])
            let manifest
            try {
                manifest = JSON.parse(zip.readFile("manifest.json").toString())
            } catch (error) {
                return false
            }
            const manifestdepack = manifestModpack(manifest)
            const icon = defaulticon
            newInstance(undefined, {
                name: normallizename,
                version: manifestdepack.modloadername,
                icon: icon,
                nickname: manifestdepack.name,
                decription: ""
            })
            const instancepath = path.join(fractaHome, "gameDirectory", normallizename)
            rmSync(path.join(instancepath, "mods"), { recursive: true })
            try {
                BrowserWindow.fromWebContents(event.sender).setProgressBar(2)
                zip.extractEntryTo(`${manifestdepack.overrides}/`, path.join(instancepath), true, true)
                BrowserWindow.fromWebContents(event.sender).setProgressBar(-1)
                readdirSync(path.join(instancepath, manifestdepack.overrides)).forEach((e) => {
                    renameSync(path.join(instancepath, manifestdepack.overrides, e), path.join(instancepath, e))
                })
                rmSync(path.join(instancepath, manifestdepack.overrides), { recursive: true })
            } catch (error) { console.error(error) }
            try {
                mkdirSync(path.join(instancepath, "mods"))
            } catch (error) { }
            const promises = manifestdepack.files.map((e) => {
                return new Promise(async (resolve, reject) => {
                    try {
                        const code = `fetch('${e.url}',{ method: 'GET', headers:{'Accept':'application/json','x-api-key':'${process.env.CURSEFORGE_KEY}'}})
                                    .then(response => response.json())
                                    .then(data => {
                                        return data;
                                    })
                                    .catch(error => {
                                        console.error('Erreur :', error);
                                        return null;
                                    });`

                        const file = await event.sender.executeJavaScript(code)
                        await download(file.data.downloadUrl, path.join(instancepath, "mods", file.data.fileName))
                        resolve()
                    } catch (error) {
                        resolve()
                        console.error(error)
                    }
                })
            })
            await Promise.all(promises)
            return true
        default:
            break;
    }
}
function openFractmod(event, instance) {
    const win = new BrowserWindow({
        width: 877,
        height: 644,
        minWidth: 877,
        minHeight: 644,
        icon: nativeImage.createFromPath(path.join(__dirname, 'asset', "image", 'mono 256.png')),
        title: "Fractalium loading...",
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            devTools: !app.isPackaged
        }
    })
    win.webContents.setWindowOpenHandler(({ url }) => {
        return {
            action: 'allow',
            overrideBrowserWindowOptions: {
                icon: nativeImage.createFromPath(path.join(__dirname, 'asset', "image", 'mono 256.png')),
                title: "Fractalium loading...",
                autoHideMenuBar: true,
                parent: win
            }
        }
    })
    win.loadFile(path.join(__dirname, "Fractmod", "Fractmod.html"))
    ipcMain.handleOnce("Fractmod:handle", () => {
        return new InstanceInfo({
            name: instance,
            path: path.join(fractaHome, "gameDirectory")
        })
    })
}
function deleteIntance(event, instance) {
    return new Promise((resolve, reject) => {
        dialog.showMessageBox(BrowserWindow.fromWebContents(event.sender), {
            buttons: ["Cancel", "Valid"],
            message: `Delete "${instance.name}" ?`,
        }).then((e) => {
            if (e.response === 1) {
                rmSync(instance.path, { recursive: true })
                resolve(true)
            } else {
                resolve(false)
            }
        })
    })

}
function tray() {
    const icon = nativeImage.createFromPath(path.join(__dirname, 'asset', "image", 'mono 256 white.png'))
    const fracttray = new Tray(icon)
    fracttray.setTitle("Fractalium")
    fracttray.setToolTip('Fractalium')
    const contextmenu = Menu.buildFromTemplate([
        {
            label: "Close",
            type: "normal",
            click: () => {
                app.quit()
            },
        },

    ])
    fracttray.setContextMenu(contextmenu)
    return fracttray
}
function getAppsJson() {
    try {
        return require(path.join(fractaHome, "apps.json"))
    } catch (err) {
        return []
    }
}
function addapp(event, url, icon) {
    const apps = getAppsJson()
    apps.push({
        icon: icon,
        url: url
    })
    writeFileSync(path.join(fractaHome, "apps.json"), JSON.stringify(apps))
}
async function getModIcon(event, modpath) {
    try {
        const file = new AdmZip(modpath)
        const doc = file.readFile("META-INF/mods.toml").toString()
        let logo = doc.match(/[\s]*catalogueImageIcon[\s]*=[\s]*"[^"]+"/)?.[0]?.match(/(?<=")[^"]+(?=")/)?.[0]
        logo = logo || doc.match(/[\s]*logoFile[\s]*=[\s]*"[^"]+"/)?.[0]?.match(/(?<=")[^"]+(?=")/)?.[0]
        const logourl = `data:image/png;base64,${file.readFile(logo).toString("base64")}` || defaulticon
        return logourl
    } catch (error) {
        return defaulticon
    }
}
function deleteMod(event, modpath) {
    try {
        rmSync(modpath)
        return true
    } catch (error) {
        return false
    }
}
async function authconfig(event, type) {
    switch (type) {
        case "mc":
            const e = await auth(BrowserWindow.fromWebContents(event.sender))
            const config = getConfigJson()
            config.auth = e
            writeFileSync(path.join(fractaHome, "config.json"), JSON.stringify(config))
            break;
        case "offline":
            await crack(BrowserWindow.fromWebContents(event.sender))
            break;
    }
    return true
}
function getRam() {
    const conf = getConfigJson()
    return {
        maxram: totalmem(),
        configram: conf.ram
    }
}
function setRam(event, rams) {
    const config = getConfigJson()
    config.ram = rams
    writeFileSync(path.join(fractaHome, "config.json"), JSON.stringify(config))
}
function changeKeepLaunch(event, value) {
    const config = getConfigJson()
    config.keepLaunch = value
    writeFileSync(path.join(fractaHome, "config.json"), JSON.stringify(config))
}

module.exports = {
    getFractaHome
}