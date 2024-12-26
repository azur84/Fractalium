import { BrowserWindow, ipcMain } from 'electron';
import { readFileSync, writeFileSync } from "fs";
import { Auth } from 'msmc';
import { MclcUser } from 'msmc/types/assets';
import path from 'path';
import { getFractaHome } from '../../path';
import { tryCatch } from '../../tools';
import { readEncryptedJsonFile, writeEncryptedJsonFile } from './security';
import { Authenticator, IUser } from 'crystal';

let accounts: Account | null

interface Account {
    accounts: {
        offline: Record<string, string>,
        online: Record<string, MclcUser>
    }
    default: string
}

interface AccountToken {
    accounts: {
        offline: Record<string, string>,
        online: Record<string, string>
    }
    default: string
}


export async function openAccount(parent: BrowserWindow) {
    const auth = new Auth('login')

    const xbox = await auth.launch("electron", {
        parent,
        width: 800,
        height: 600,
        titleBarStyle: "hidden",
        titleBarOverlay: {
            height: 35,
            color: "#FFFFFF00",
            symbolColor: "#FFFFFF"
        }
    })

    const datas = readAccountFile()

    datas.accounts.online[(await xbox.getMinecraft()).mclc().uuid] = xbox.save()

    writeEncryptedJsonFile(path.join(getFractaHome(), "accounts"), datas)

    accounts = await getAccountWithFile()

    const acc = await xbox.getMinecraft()
    return acc.mclc()
}

async function refreshAccounts(tokens: Record<string, string>) {
    const auth = new Auth("none")
    let ret: Record<string, MclcUser> = {}
    for (const element in tokens) {
        if (Object.prototype.hasOwnProperty.call(tokens, element)) {
            const token = tokens[element];
            const xbox = await auth.refresh(token)
            const mc = await xbox.getMinecraft()
            ret[element] = mc.mclc()
        }
    }
    return ret
}

export async function getAccounts() {
    if (accounts) return accounts
    const acc = await getAccountWithFile()
    accounts = acc
    return acc
}

function readAccountFile() {
    const filepath = path.join(getFractaHome(), "accounts")
    const file = tryCatch(readEncryptedJsonFile, filepath)
    const datas: AccountToken = file.witherr ? { accounts: { offline: {}, online: {} }, default: 0 } : file.value
    return datas
}

async function getAccountWithFile():Promise<Account> {
    const datas: AccountToken = readAccountFile()

    const datasonline = await refreshAccounts(datas.accounts.online)

    return {
        accounts: {
            offline: datas.accounts.offline,
            online: datasonline
        },
        default: datas.default
    }
}

export async function setDefault(id:string) {
    const datas = readAccountFile()
    datas.default = id
    writeEncryptedJsonFile(path.join(getFractaHome(), "accounts"), datas)
}

export async function getDefault(): Promise<IUser> {
    const datas = await getAccounts()
    return datas.accounts.online[datas.default] as IUser ?? await Authenticator.getAuth(datas.accounts.offline[datas.default] ?? "Steve")
}

ipcMain.handle("account:openAccount", async (ev) => {
    return await openAccount(BrowserWindow.fromWebContents(ev.sender)!)
})

ipcMain.handle("account:getAccount", async () => {
    return await getAccounts()
})

ipcMain.on("account:setDefault", async (ev, id) => {
    await setDefault(id)
})