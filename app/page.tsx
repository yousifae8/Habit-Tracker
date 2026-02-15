"use client";
import styles from "./page.module.css";
import { Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Button } from "@mui/material";
export default function Home() {
  const title = "Welcome to Habit Tracker App!";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const stPoint = 80;
    const onScroll = () => {
      setScrolled(window.scrollY > stPoint);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className={`${styles.container} ${scrolled ? styles.scrolled : ""}`}>
      <main className={styles.main}>
        <div>
          <Typography variant="h1" gutterBottom color="common.white">
            <div className={styles.title}>{title}</div>
          </Typography>

          <Typography variant="h4" gutterBottom color="white">
            Start To Build The Best Version Of Yourself
          </Typography>
        </div>
      </main>
      <main className={styles.buttonsContainer}>
        <div className={styles.buttons}>
          <Button sx={{padding:3, width:200, fontWeight: "bold", height:70, fontSize:20, color:"white",border:"3px solid white "}} className={styles.btn}>Register</Button>
          <Button sx={{padding:3,width:200,fontWeight: "bold",  height:70, fontSize:20 , color:"white", border:"3px solid white "}} className={styles.btn}>Login</Button>
        </div>
      </main>
    </div>
  );
}
