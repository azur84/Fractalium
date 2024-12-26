import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { getFractaHome } from '../path';

export function getJavaVersion(minecraftVersion: string) {
    const versionMapping = [
        { range: ['1.0', '1.12.2'], javaVersion: 8 },
        { range: ['1.13', '1.16.5'], javaVersion: 8 },
        { range: ['1.17', '1.17'], javaVersion: 17 },
        { range: ['1.18', '1.20'], javaVersion: 17 },
        { range: ['1.21', '1.21'], javaVersion: 21 }
    ];

    const compareVersions = (v1: string, v2: string) => {
        const [a1, b1] = v1.split('.').map(Number)
        const [a2, b2] = v2.split('.').map(Number)
        return a1 === a2 ? b1 - b2 : a1 - a2;
    };

    const isSnapshot = (version: string) => /\d{2}w\d{2}[a-z]/.test(version);

    if (isSnapshot(minecraftVersion)) {
        const year = parseInt(minecraftVersion.slice(0, 2), 10)
        const week = parseInt(minecraftVersion.slice(2, 4), 10)

        if (year >= 21 && week >= 40) return 21
        if (year >= 20) return 17
        if (year >= 17) return 16
        return 8
    }

    for (const { range, javaVersion } of versionMapping) {
        const [min, max] = range
        if (
            compareVersions(minecraftVersion, min) >= 0 &&
            compareVersions(minecraftVersion, max) <= 0
        ) {
            return javaVersion;
        }
    }

    return 8;
}

export async function installJava(version: number) {
    const downloadpath = path.join(getFractaHome(), ".cache", "download")
    switch (version) {
        case 21:
            const finalpath_21 = path.join(getFractaHome(), "jre", "21")
            const file_21 = await fetch("https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.5%2B11/OpenJDK21U-jre_x64_windows_hotspot_21.0.5_11.zip").then((f) => f.arrayBuffer())
            const file_21_zip = new AdmZip(Buffer.from(file_21))
            if (fs.existsSync(finalpath_21)) fs.rmSync(finalpath_21, { force: true, recursive: true })
            file_21_zip.extractAllTo(downloadpath)
            fs.renameSync(path.join(downloadpath, "jdk-21.0.5+11-jre"), finalpath_21)
            break;
        case 17:
            const finalpath_17 = path.join(getFractaHome(), "jre", "17")
            const file_17 = await fetch("https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.13%2B11/OpenJDK17U-jre_x64_windows_hotspot_17.0.13_11.zip").then((f) => f.arrayBuffer())
            const file_17_zip = new AdmZip(Buffer.from(file_17))
            if (fs.existsSync(finalpath_17)) fs.rmSync(finalpath_17, { force: true, recursive: true })
            file_17_zip.extractAllTo(downloadpath)
            fs.renameSync(path.join(downloadpath, "jdk-17.0.13+11-jre"), finalpath_17)
            break
        case 8:
            const finalpath_8 = path.join(getFractaHome(), "jre", "8")
            const file_8 = await fetch("https://github.com/adoptium/temurin8-binaries/releases/download/jdk8u432-b06/OpenJDK8U-jre_x64_windows_hotspot_8u432b06.zip").then((f) => f.arrayBuffer())
            const file_8_zip = new AdmZip(Buffer.from(file_8))
            if (fs.existsSync(finalpath_8)) fs.rmSync(finalpath_8, { force: true, recursive: true })
            file_8_zip.extractAllTo(downloadpath)
            fs.renameSync(path.join(downloadpath, "jdk8u432-b06-jre"), finalpath_8)
            break
    }
}

export function isInstalledJava(version: number) {
    return fs.existsSync(path.join(getFractaHome(), "jre", version.toString(10)))
}

export async function checkJava(version: number) {
    try {
        if (!isInstalledJava(version)) await installJava(version)
        return true
    } catch (error) {
        return false
    }
}