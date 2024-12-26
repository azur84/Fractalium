import { Furnissor } from "./furnissor";


export interface InstanceConfig {
    name: string
    description?: string
    mcversion: string
    mods?: Mod[]
    furnissor: Furnissor
    modsloader?: Modsloader
    mapping?: string[]
    options?: {},
    path?:string
}

interface Mod {
    filename: string
    displayName: string
    icon: string
    furnissor: Furnissor
}

interface Modsloader {
    name: string
    version: string

}

export function isValidInstanceConfig(obj: any): obj is InstanceConfig {
    return typeof obj.name === "string" &&
        typeof obj.mcversion === "string" &&
        typeof obj.furnissor === "string" &&
        /(local|modrith)/.test(obj.furnissor)
}