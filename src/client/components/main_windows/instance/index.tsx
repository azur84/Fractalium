import React, { FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export const InstanceMainMenu: FC<{}> = () => {
    const [instance, setInstance] = useState<Instance>()
    const { name, page } = useParams()

    useEffect(() => {
        window.launcher.getInstance(name!).then((instancedata) => {
            if (instancedata) setInstance(instancedata)
        })
    }, [name])

    if (page === "mods") {
        return <div>
            <h2>Mods</h2>
        </div>

    }

    return <div>
        <h2>{instance?.name}</h2>
        <button onClick={(e) => {
            window.launcher.startInstance(name!, instance!)
        }}>Start</button>
    </div>
}