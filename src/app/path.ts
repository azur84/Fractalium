import { app } from "electron"
import fs from "fs";
import path from "path";
import { tryCatch } from "./tools";

export function getFractaHome() {
    return path.join(app.getPath("appData"), ".fractalium")
}

export function getClientPath() {
    return path.join("./", "client")
}

export function getInstancesPath() {
    return path.join(getFractaHome(), "instances")
}

const sessionPath = path.join(getFractaHome(), ".cache", "session")
if (!fs.existsSync(sessionPath)) tryCatch(fs.mkdirSync, sessionPath, { recursive: true })
app.setPath("sessionData", sessionPath)

const userPath = path.join(getFractaHome(), ".cache", "user")
if (!fs.existsSync(userPath)) tryCatch(fs.mkdirSync, userPath, { recursive: true })
app.setPath("userData", userPath)
