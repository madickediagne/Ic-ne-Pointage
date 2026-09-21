"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => console.log("Service Worker enregistré : ", reg.scope))
          .catch((err) => console.error("Erreur Service Worker : ", err));
      });
    }
  }, []);

  return null;
}
