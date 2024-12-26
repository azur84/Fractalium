import React, { FC, useEffect, useState } from "react";

export const Accounts: FC<{}> = () => {
    const [accounts, setAccounts] = useState<Account>()

    useEffect(() => {
        window.launcher.account.getAccount().then(async (e) => {
            setAccounts(e)
        })
    }, [])

    function accountdiv(uuid: string, name: string) {
        return <div key={uuid}
            className="account_div"
            onClick={() => {
                window.launcher.account.setDefault(uuid)
            }}
            style={{
                display: "flex",
                alignItems: "center"
            }}>
            <img src={`https://minotar.net/cube/${uuid}/100.png`} style={{
                width: "4vh",
                height: "5vh"
            }} /><h4 style={{
                marginLeft: "3px",
                marginTop: "0",
                marginBottom: "0",
                marginRight: "0"
            }}>{name}</h4>
        </div>
    }


    return <div>
        {
            accounts?.accounts.online && Object.keys(accounts.accounts.online).map((e) => {
                return accountdiv(accounts.accounts.online[e], accounts.accounts.online[e].name)
            })
        }
        {
            accounts?.accounts.offline && Object.keys(accounts.accounts.offline).map((e) => {
                return accountdiv(e, e)
            })
        }
    </div>
}