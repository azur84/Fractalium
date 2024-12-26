import fs from 'fs';
import path from 'path';
import { getFractaHome } from '../path';

export async function installFabric(name: string, version: string, mcversion: string) {
    const ver = path.join(getFractaHome(), "instances", name, ".minecraft", "versions", `fabric-loader-${version}-${mcversion}`)

    if (!fs.existsSync(path.join(ver, `fabric-loader-${version}-${mcversion}.json`))) {
        const profile = await fetch(`https://meta.fabricmc.net/v2/versions/loader/${mcversion}/${version}/profile/json`).then((v) => v.json()) as any[]

        if (!fs.existsSync(ver)) fs.mkdirSync(ver, { recursive: true })
        fs.writeFileSync(path.join(ver, `fabric-loader-${version}-${mcversion}.json`), JSON.stringify(profile))
    }
    return {
        version: {
            number: mcversion,
            type: "release",
            custom: `fabric-loader-${version}-${mcversion}`
        }
    }
}

export async function installForge(version: string, mcversion: string, universal: boolean) {
    const ver = path.join(getFractaHome(), ".cache", 'launcher', "installer")

    if (!fs.existsSync(path.join(ver, `forge-${version}.jar`))) {
        const installer = await fetch(universal ? `https://maven.minecraftforge.net/net/minecraftforge/forge/${mcversion}-${version}/forge-${mcversion}-${version}-universal.jar` : `https://maven.minecraftforge.net/net/minecraftforge/forge/${mcversion}-${version}/forge-${mcversion}-${version}-installer.jar`)
        if (!installer.ok) throw new Error("Unkowned version !")
        if (!fs.existsSync(ver)) fs.mkdirSync(ver, { recursive: true })
        fs.writeFileSync(path.join(ver, `forge-${version}.jar`), Buffer.from(await installer.arrayBuffer()))
    }

    return {
        version: {
            number: mcversion,
            type: "release",
            custom: `forge-${version}`
        },
        forge: path.join(ver, `forge-${version}.jar`)
    }
}

export async function installNeoForge(version: string, mcversion: string) {
    const ver = path.join(getFractaHome(), ".cache", 'launcher', "installer")

    if (!fs.existsSync(path.join(ver, `neoforge-${version}.jar`))) {
        const installer = await fetch(`https://maven.neoforged.net/releases/net/neoforged/neoforge/${version}/neoforge-${version}-installer.jar`)
        if (!installer.ok) throw new Error("Unkowned version !")
        if (!fs.existsSync(ver)) fs.mkdirSync(ver, { recursive: true })
        fs.writeFileSync(path.join(ver, `neoforge-${version}.jar`), Buffer.from(await installer.arrayBuffer()))
    }

    return {
        version: {
            number: mcversion,
            type: "release",
            custom: `neoforge-${version}`
        },
        forge: path.join(ver, `neoforge-${version}.jar`)
    }
}

export async function installQuilt(name: string, version: string, mcversion: string) {
    const ver = path.join(getFractaHome(), "instances", name, ".minecraft", "versions", `quilt-${version}-${mcversion}`)

    if (!fs.existsSync(path.join(ver, `quilt-${version}-${mcversion}.json`))) {
        const profile = await fetch(`https://meta.quiltmc.org/v3/versions/loader/${mcversion}/${version}/profile/json`).then((v) => v.json()) as any[]

        if (!fs.existsSync(ver)) fs.mkdirSync(ver, { recursive: true })
        fs.writeFileSync(path.join(ver, `quilt-${version}-${mcversion}.json`), JSON.stringify(profile))
    }

    return {
        version: {
            number: mcversion,
            type: "release",
            custom: `quilt-${version}-${mcversion}`
        }
    }
}

export async function installLoader(loader: string, name: string, version: string, mcversion: string, universal: boolean) {
    switch (loader) {
        case "vanilla":
            return {
                version: {
                    number: mcversion,
                    type: "release",
                }
            }
        case "fabric":
            return await installFabric(name, version, mcversion)
        case "forge":
            return await installForge(version, mcversion, universal)
        case "neoforge":
            return await installNeoForge(version, mcversion)
        case "quilt":
            return await installQuilt(name, version, mcversion)
        default:
            throw new Error("Unkown Loader.");
    }
}