"use client";

import { useEffect, useState } from "react";
import styles from "./interactive-theme-preview.module.css";

type Device = "desktop" | "tablet" | "mobile";

function ReloadIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M15.5 6.5V3m0 0H12m3.5 0-2.1 2.1A6.5 6.5 0 1 0 16.2 11" /></svg>;
}

function OpenIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 4H4v12h12v-3M10 10l6-6M11 4h5v5" /></svg>;
}

export function InteractiveThemePreview({ path, title }: { path: string; title: string }) {
  const [device, setDevice] = useState<Device>("desktop");
  const [reloadKey, setReloadKey] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fallback = window.setTimeout(() => setLoaded(true), 3500);
    return () => window.clearTimeout(fallback);
  }, [reloadKey]);

  function reload() {
    setLoaded(false);
    setReloadKey((key) => key + 1);
  }

  return (
    <div className={styles.frame}>
      <div className={styles.toolbar}>
        <div className={styles.lights} aria-hidden="true"><span /><span /><span /></div>
        <div className={styles.devices} role="group" aria-label="Preview size">
          {(["desktop", "tablet", "mobile"] as Device[]).map((option) => (
            <button
              className={device === option ? styles.active : ""}
              key={option}
              type="button"
              aria-pressed={device === option}
              onClick={() => setDevice(option)}
            >
              {option[0].toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
        <div className={styles.actions}>
          <button type="button" onClick={reload} aria-label="Reload preview"><ReloadIcon /></button>
          <a href={path} target="_blank" rel="noreferrer" aria-label="Open full-screen preview"><OpenIcon /></a>
        </div>
      </div>

      <div className={styles.stage}>
        <div className={styles.viewport} data-device={device}>
          <div className={`${styles.loading}${loaded ? ` ${styles.ready}` : ""}`} aria-live="polite">
            {loaded ? "Preview ready" : "Loading live preview"}
          </div>
          <iframe
            key={reloadKey}
            src={path}
            title={`${title} interactive preview`}
            onLoad={() => setLoaded(true)}
          />
        </div>
      </div>
      <p className={styles.hint}><span /> This preview is interactive: open the menu, products, search, and size controls.</p>
    </div>
  );
}
