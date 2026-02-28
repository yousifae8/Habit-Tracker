"use client"

import style from "./home.module.css"
import { useTheme }  from "@mui/material/styles";
const Homepage = () => {
    const theme = useTheme();
    return (
<div style={{background: theme.palette.background.default, color: theme.palette.text.primary, height: "100vh"}} >
    <header className={style.header} >
        Habit Tracker
    </header>
</div>
    )
}

export default Homepage