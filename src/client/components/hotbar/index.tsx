import React, { FC } from "react";
import Logo from "../../assets/images/logo/fractalium.svg?react";
import { Accounts_menu } from "./accounts";

export const HotBar: FC<{}> = () => {
    const [visibility, setVisibility] = React.useState(false);

    return <>
        <div className="app_bar_left">
            <div className="app_bar_title_div">
                <Logo height={35} width={35} />
            </div>
            <div className={`accounts_manager${visibility ? " selected" : ""}`}>
                <p onClick={() => {
                    setVisibility(true);
                }}>{"Accounts"}</p>
                <Accounts_menu visible={visibility} setVisible={setVisibility}></Accounts_menu>
            </div>
        </div>
        <div className="app_bar_right">

        </div>
    </>
}