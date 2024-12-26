/// <reference types="vite/client"/>
import React, { FC, useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import Fabriclogo from "../../../assets/images/mod_loader/fabric.svg?react"
import Forgelogo from "../../../assets/images/mod_loader/forge.svg?react"
import Neoforgelogo from "../../../assets/images/mod_loader/neoforge.svg?react"
import Quiltlogo from "../../../assets/images/mod_loader/quilt.svg?react"
import Vanillalogo from "../../../assets/images/mod_loader/vanilla.svg?react"
import { getVersion, Version } from "./modloaderlist"

export const ModloaderQuestionnaire: FC<{}> = () => {
    return <div className="questionnaire_instance">
        <h4>{"Select a Modloader."}</h4>
        <div className="modloader_select_div">
            <div>
                <Link to={`./vanilla`}>
                    <Vanillalogo />
                    <h2>{"Vanilla"}</h2>
                </Link>
            </div>

            <div >
                <Link to={"./fabric"}>
                    <Fabriclogo />
                    <h2>{"Fabric"}</h2>
                </Link>
            </div>

            <div >
                <Link to={"./forge"}>
                    <Forgelogo />
                    <h2>{"Forge"}</h2>
                </Link>
            </div>

            <div >
                <Link to={"./neoforge"}>
                    <Neoforgelogo />
                    <h2>{"Neoforge"}</h2>
                </Link>
            </div>

            <div >
                <Link to={"./quilt"}>
                    <Quiltlogo />
                    <h2>{"Quilt"}</h2>
                </Link>
            </div>
        </div>
    </div>
}

export const VanillaVersionQuestionnaire: FC<{}> = () => {
    const [modloadversions, setModloaderversions] = useState<Version>()
    const { modloader } = useParams()
    const navigate = useNavigate()

    const modloaderstr = modloader as "vanilla" | "forge" | "neoforge" | "fabric" | "quilt"

    useEffect(() => {
        setModloaderversions(undefined)
        getVersion(modloaderstr === "vanilla" ? undefined : modloaderstr).then((v) => {
            setModloaderversions(v)
        })
    }, [modloaderstr])

    let mapversion = new Map<string, string[]>()
    modloadversions?.vanilla.filter((v) => v.stable).forEach((v) => {
        const spited = v.id.split(".")
        if (!mapversion.has(`${spited[0]}.${spited[1]}`)) mapversion.set(`${spited[0]}.${spited[1]}`, [])
        mapversion.get(`${spited[0]}.${spited[1]}`)!.push(v.id)
    })

    const divs: React.JSX.Element[] = []
    for (const v of mapversion) {
        divs.push(<div key={v[0]} className={`main_version version_${v[0].replace(".", "_")}`}>
            <h4>{v[0]}</h4>
            <div className="subversions">
                {
                    v[1].reverse().map((b) => <Link key={b} to={`./${b}`}>{b}</Link>)
                }
            </div>
        </div>)
    }

    return <div className="questionnaire_instance">
        <h4>{"Choose a minecraft version."}</h4>
        <div className="vannilla_version_div_snapshoot">
            <div className="vanilla_version_div">
                {
                    divs
                }
            </div>
            <div>
                <input type="text" name="snapshoot_version" id="snapshoot_version" list="snapshoot_version_data" />
                <datalist id="snapshoot_version_data">
                    {
                        modloadversions?.vanilla.map((v) => {
                            return <option key={v.id} value={v.id}></option>
                        })
                    }
                </datalist>
                <button onClick={(ev) => {
                    const input = document.getElementById("snapshoot_version") as any
                    navigate(`./${input.value}`)
                }}>Valid</button>
            </div>
        </div>
    </div>
}

export const ModloaderVersionQuestionnaire: FC<{}> = () => {
    const [modloadversions, setModloaderversions] = useState<Version>()
    const { modloader, mcversion } = useParams()

    const navigate = useNavigate()

    const modloaderstr = modloader as "forge" | "neoforge" | "fabric" | "quilt"

    useEffect(() => {
        if (modloader === "vanilla") {
            navigate("./null")
            return
        }
        setModloaderversions(undefined)
        getVersion(modloaderstr).then((v) => {
            setModloaderversions(v)
        })
    }, [modloaderstr])

    return <div className="questionnaire_instance">
        <h4>{`Choose a ${modloader} version.`}</h4>
        <div className="modloader_version_div">
            {
                modloadversions?.modloader?.filter((v) => !v.vanilla || v.vanilla === mcversion).map((v) => {
                    return <div key={v.id}>
                        <h4><Link to={`./${v.id}`}>{v.id}</Link></h4>
                    </div>
                })
            }
        </div>
    </div>
}

export const InstanceCreationEnd: FC<{}> = () => {
    const [name, setName] = useState<string>()
    const { modloader, mcversion, modversion } = useParams()
    const navigate = useNavigate()

    return <div className="questionnaire_instance">
        <form onSubmit={(e) => {
            e.preventDefault()
            window.launcher.createInstance({
                name: name!,
                furnissor: "local",
                mcversion: mcversion!,
                modsloader: modloader === "vanilla" ? undefined : { name: modloader!, version: modversion! }
            }).then(()=>navigate(`../../../../instance/${name}`))
        }} >
            <label htmlFor="instance_name">Name :</label>
            <input type="text" name="instance_name" id="instance_name" pattern="\w{2,32}" onChange={(e) => setName(e.currentTarget.value)} />
            <button type="submit">Create !</button>
        </form>
    </div>
}