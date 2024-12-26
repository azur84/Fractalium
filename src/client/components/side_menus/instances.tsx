import React, { FC, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Createimage from "../../assets/images/icons/add.svg?react";
import defaultimage from "../../assets/images/icons/block.svg";
import Defaultimagereact from "../../assets/images/icons/block.svg?react";
import SettingImage from "../../assets/images/icons/menu.svg?react";

export const InstancesSideMenu: FC<{}> = () => {
    const [instances, setInstances] = useState<Instance[]>([])

    useEffect(() => {
        window.launcher.getInstances().then((instances) => {
            if (instances) setInstances(instances)
        })
    }, [])

    return <><div>
        <div className="instances_select">
            {instances.map((instance) => {
                return <Link key={instance.name} to={`./instance/${instance.name}/info`}><div className="instances_menu_element">
                    {
                        instance.icon ? <img src={instance.icon} onError={(event) => {
                            event.currentTarget.onerror = null
                            event.currentTarget.src = defaultimage;
                        }} /> : <Defaultimagereact />
                    }
                    <h4>{instance.name}</h4>
                </div>
                </Link>
            })}
        </div>
        <Link to={"instances/create"}>
            <div className="instances_menu_create" >
                <Createimage width={32} height={32} />
                <h4>{"Create Instance"}</h4>
            </div>
        </Link>
        <Link className="settings_menu_a" to={"settings"}>
            <div className="settings_menu">
                <SettingImage width={32} height={32} />
                <h4>{"Settings"}</h4>
            </div>
        </Link>
    </div>
    </>
}
