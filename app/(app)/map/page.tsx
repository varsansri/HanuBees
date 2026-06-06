"use client";

import { useEffect, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";

const YELLOW = "#ffbe00", GREEN = "#98aa9d", FG = "#eaeaea", BG = "#121212";

const CITY_CENTERS: Record<string, [number, number]> = {
  Coimbatore: [76.9558, 11.0168],
  Chennai: [80.2707, 13.0827],
  "Los Angeles": [-118.2437, 34.0522],
  Melbourne: [144.9631, -37.8136],
};

export default function MapPage() {
  const mapRef = useRef<any>(null);
  const glRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);
  const [city, setCity] = useState("Coimbatore");
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!glRef.current) glRef.current = (await import("maplibre-gl")).default;
      const gl = glRef.current;
      if (cancelled) return;

      if (!mapRef.current && containerRef.current) {
        mapRef.current = new gl.Map({
          container: containerRef.current,
          style: "https://tiles.openfreemap.org/styles/liberty",
          center: CITY_CENTERS[city],
          zoom: 12,
        });
        mapRef.current.addControl(new gl.NavigationControl(), "top-right");
      }
      const map = mapRef.current;
      map.flyTo({ center: CITY_CENTERS[city], zoom: 12 });

      const res = await fetch(`/api/map?city=${encodeURIComponent(city)}`);
      const data = await res.json();
      if (cancelled) return;
      setCount(data.count || 0);

      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      for (const b of data.businesses || []) {
        if (b.lat == null || b.lng == null) continue;
        const el = document.createElement("div");
        el.style.cssText = `width:16px;height:16px;border-radius:50%;background:${YELLOW};border:2px solid #121212;box-shadow:0 0 0 1px ${YELLOW};cursor:pointer`;
        const popup = new gl.Popup({ offset: 14, closeButton: false }).setHTML(
          `<div style="font-family:sans-serif;min-width:160px">
             <strong style="font-size:14px">${b.name}</strong><br/>
             <span style="font-size:12px;color:#555">${[b.category, b.location].filter(Boolean).join(" · ")}</span><br/>
             ${b.phone ? `<span style="font-size:12px;color:#0a7">${b.phone}</span><br/>` : ""}
             <a href="/${b.slug}" style="font-size:12px;color:#1a73e8">View →</a>
           </div>`
        );
        markersRef.current.push(new gl.Marker({ element: el }).setLngLat([b.lng, b.lat]).setPopup(popup).addTo(map));
      }
    })();
    return () => { cancelled = true; };
  }, [city]);

  // Sits above the bottom nav (which is ~82px tall).
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 82, background: BG }}>
      <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 5, display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "linear-gradient(#121212cc,#12121200)" }}>
        <span style={{ color: YELLOW, fontWeight: 700, fontSize: 16 }}>Map</span>
        <select value={city} onChange={(e) => setCity(e.target.value)} style={{ background: "#1a1a1a", color: FG, border: "1px solid rgba(234,234,234,0.15)", borderRadius: 8, padding: "7px 10px", fontSize: 14, fontFamily: "inherit" }}>
          {Object.keys(CITY_CENTERS).map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <span style={{ color: GREEN, fontSize: 13, fontWeight: 600 }}>{count} on map</span>
      </div>
    </div>
  );
}
