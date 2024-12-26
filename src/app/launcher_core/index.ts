import { getInstancesPath } from "../path";
import { tryCatch } from "../tools";
import fs from "fs";
import path from 'path';
import { InstanceConfig, isValidInstanceConfig } from "./instance";
import { ipcMain } from "electron";
import { startInstance } from "./launcher";
import "./accounts/index"

export function getInstances(): InstanceConfig[] | void {

    tryCatch(fs.mkdirSync, getInstancesPath(), { recursive: true })

    const instancesdirs = tryCatch(fs.readdirSync, getInstancesPath(), { withFileTypes: true })

    if (instancesdirs.witherr) return

    const ret: InstanceConfig[] = []

    for (const dir of instancesdirs.value) {
        if (!dir.isDirectory()) continue
        const configpath = path.join(dir.path, dir.name, "instance.json")
        if (!fs.existsSync(configpath)) continue

        const configbuffer = tryCatch(fs.readFileSync, configpath)
        if (configbuffer.witherr) continue

        let config = JSON.parse(configbuffer.value.toString("utf-8"))

        if (!isValidInstanceConfig(config)) continue

        if (config.path) {
            const realconfigbuffer = tryCatch(fs.readFileSync, configpath)
            if (realconfigbuffer.witherr) continue

            const realconfig = JSON.parse(configbuffer.value.toString("utf-8"))

            if (!isValidInstanceConfig(realconfig)) continue
            config = realconfig
        }

        ret.push(config)
    }

    return ret
}

ipcMain.handle("launcher:getInstances", () => {
    return getInstances()
})

export function createInstance(opt: InstanceConfig) {
    const instancepath = path.join(getInstancesPath(), opt.name)
    const instancejsonpath = path.join(instancepath, "instance.json")

    fs.mkdirSync(instancepath)
    fs.writeFileSync(instancejsonpath, JSON.stringify(opt))
    return true
}

ipcMain.handle("launcher:createInstance", (e, opt) => {
    return createInstance(opt)
})

export function getInstance(name: string) {
    try {
        const instanceoptpath = path.join(getInstancesPath(), name, "instance.json")

        const configbuffer = fs.readFileSync(instanceoptpath)

        const config = JSON.parse(configbuffer.toString("utf-8"))

        return config as InstanceConfig
    } catch (error) {
        return null
    }

}

ipcMain.handle("launcher:getInstance", (e, name) => {
    return getInstance(name)
})

ipcMain.on("launcher:startInstance", (e, name, opt) => {
    startInstance(name, opt)
})