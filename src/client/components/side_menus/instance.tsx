import React, { FC } from "react";
import { Link, Navigate, useParams } from "react-router-dom"
import Arrow from "../../assets/images/icons/arrow.svg?react"
import Block from "../../assets/images/icons/block.svg?react"
import Blocks from "../../assets/images/icons/blocks.svg?react"
import Pack from "../../assets/images/icons/pack.svg?react"
import Lblock from "../../assets/images/icons/L_block.svg?react"
import Three from "../../assets/images/icons/three_d.svg?react"
import World from "../../assets/images/icons/world_folder.svg?react"

export const InstanceSideMenu: FC<{}> = () => {
    const { name, page } = useParams()

    return <div>
        <div className="instance_pages">
            <Link to={"../"}><Arrow height={25} /><h4>Back</h4></Link>
            <Link to={`../instance/${name}/info`}><Block height={25} /><h4 style={{fontStyle:"italic"}}>{name}</h4></Link>
            <Link to={`../instance/${name}/mods`}><Blocks height={25} /><h4>Mods</h4></Link>
            <Link to={`../instance/${name}/resources`}><Pack height={25} /><h4>Resources<br/>Packs</h4></Link>
            <Link to={`../instance/${name}/shaders`}><Three height={25} /><h4>Shaders<br/>Packs</h4></Link>
            <Link to={`../instance/${name}/servers`}><Lblock height={25} /><h4>Servers</h4></Link>
            <Link to={`../instance/${name}/worlds`}><World height={25} /><h4>Worlds</h4></Link>
        </div>
    </div>
}