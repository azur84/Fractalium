import { XMLParser } from "fast-xml-parser"

const parser = new XMLParser()

interface VanillaVersion {
    id: string,
    stable: boolean
}

interface ModloaderVersion {
    id: string
    vanilla?: string
}

export interface Version {
    vanilla: VanillaVersion[]
    modloader?: ModloaderVersion[]
}

export async function getVersion(modloader?: "forge" | "neoforge" | "fabric" | "quilt"): Promise<Version> {
    switch (modloader) {
        case "fabric":
            const manifest_0 = await fetch("https://piston-meta.mojang.com/mc/game/version_manifest_v2.json").then(v => v.json()) as { versions: any[] }
            const loaderversionmanifest = await fetch("https://meta.fabricmc.net/v2/versions/loader").then(v => v.json())
            const intermediarymanifest = await fetch("https://meta.fabricmc.net/v2/versions/intermediary").then(v => v.json())

            return {
                vanilla: intermediarymanifest.map((v) => ({
                    id: v.version,
                    stable: manifest_0.versions.find((b) => b.id === v.version)?.type === "release"
                })),
                modloader: loaderversionmanifest.map((v) => ({
                    id: v.version
                }))
            }
        case "forge":
            const forge_manifest = parser.parse(await fetch("https://maven.minecraftforge.net/net/minecraftforge/forge/maven-metadata.xml").then(v => v.text()))

            return {
                vanilla: forge_manifest.metadata.versioning.versions.version.map((v: string) => v.split("-")[0]).filter((value, index, self) => self.indexOf(value) === index).map((v) => ({ id: v, stable: true })),
                modloader: forge_manifest.metadata.versioning.versions.version.map((v: string) => ({
                    id: v.split("-")[1],
                    vanilla: v.split("-")[0]
                }))
            }
        case "neoforge":
            const neoforge_manifest = parser.parse(await fetch("https://maven.neoforged.net/releases/net/neoforged/neoforge/maven-metadata.xml").then(v => v.text()))

            return {
                vanilla: neoforge_manifest.metadata.versioning.versions.version.map((v: string) => v.split(".")).map((v) => `1.${v[0]}.${v[1]}`).filter((value, index, self) => self.indexOf(value) === index).map((v) => ({ id: v, stable: true })),
                modloader: neoforge_manifest.metadata.versioning.versions.version.map((v: string) => {
                    const d = v.split(".")
                    return {
                        id: v,
                        vanilla: `1.${d[0]}.${d[1]}`
                    }
                })
            }
        case "quilt":
            const manifest_1 = await fetch("https://piston-meta.mojang.com/mc/game/version_manifest_v2.json").then(v => v.json()) as { versions: any[] }
            const quiltloaderversionmanifest = await fetch("https://meta.quiltmc.org/v3/versions/loader").then(v => v.json())
            const quiltintermediarymanifest = await fetch("https://meta.quiltmc.org/v3/versions/intermediary").then(v => v.json())

            return {
                vanilla: quiltintermediarymanifest.map((v) => ({
                    id: v.version,
                    stable: manifest_1.versions.find((b) => b.id === v.version)?.type === "release"
                })),
                modloader: quiltloaderversionmanifest.map((v) => ({
                    id: v.version
                }))
            }
        default:
            const vanilla_manifest = await fetch("https://piston-meta.mojang.com/mc/game/version_manifest_v2.json").then(v => v.json())

            return {
                vanilla: vanilla_manifest.versions.map((v) => ({
                    id: v.id,
                    stable: v.type === "release"
                }))
            }
    }


}