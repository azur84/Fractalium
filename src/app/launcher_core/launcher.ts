import { Authenticator, Client } from "crystal";
import { app } from "electron";
import path from 'path';
import { getFractaHome, getInstancesPath } from "../path";
import { InstanceConfig } from "./instance";
import { checkJava, getJavaVersion } from "./jre";
import { installLoader } from "./loader";
import { getDefault } from "./accounts";

export async function startInstance(name: string, opt: InstanceConfig) {
    const jreversion = getJavaVersion(opt.mcversion)
    await checkJava(jreversion)

    const loaderopt = await installLoader(opt.modsloader!.name, name, opt.modsloader!.version, opt.mcversion, jreversion === 8)

    const client = new Client()
    const process = client.launch({
        ...loaderopt,
        cache: path.join(getFractaHome(), ".cache", "launcher"),
        root: path.join(getInstancesPath(), name, ".minecraft"),
        memory: {
            max: "3G",
            min: "2G"
        },
        authorization: await getDefault(),
        javaPath: path.join(getFractaHome(), "jre", jreversion.toString(10), "bin", "javaw.exe"),
        overrides: {
            libraryRoot: path.join(getFractaHome(), "libraries"),
            assetRoot: path.join(getFractaHome(), "assets"),
            fw: {
                version: "1.6.0"
            }
        }
    })
    if (!app.isPackaged) client.on("debug", (e) => {
        console.log(e)
    })
    client.on("data", (v) => { console.log(v) })

    return {
        client,
        process
    }
}

