"use client";

import {ThemeProvider} from "@mui/material/styles";
import {CssBaseline} from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";

export default function Providers({children}: { children: React.ReactNode }) {
    return (
        <AppRouterCacheProvider options={{key: "mui"}}>
            <CssBaseline>
            {children}
            </CssBaseline>
        </AppRouterCacheProvider>
    )
}
