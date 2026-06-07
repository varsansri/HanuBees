"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import "maplibre-gl/dist/maplibre-gl.css";

const YELLOW = "var(--yellow)", GREEN = "var(--green)", FG = "var(--fg)", BG = "var(--bg)";
const MAP_YELLOW = "#ffbe00"; // MapLibre paint can't parse CSS var() — needs a literal color
const MAP_GREEN = "#98aa9d";  // contributions (people's local knowledge)

const KIND_LABEL: Record<string, string> = {
  availability: "Live availability", experience: "Experience", tip: "Tip", question: "Question",
};

const CITY_CENTERS: Record<string, [number, number]> = {
  Coimbatore: [76.9558, 11.0168],
  Chennai: [80.2707, 13.0827],
  "Los Angeles": [-118.2437, 34.0522],
  Melbourne: [144.9631, -37.8136],
};

// normalize ?city= (accepts "coimbatore", "los-angeles", etc.)
function resolveCity(raw: string | null): string {
  if (!raw) return "Coimbatore";
  const r = raw.toLowerCase().replace(/-/g, " ");
  return Object.keys(CITY_CENTERS).find((c) => c.toLowerCase() === r) || "Coimbatore";
}

export default function MapPage() {
  return (
    <Suspense fallback={<div style={{ position: "fixed", inset: 0, background: BG }} />}>
      <MapInner />
    </Suspense>
  );
}

function MapInner() {
  const sp = useSearchParams();
  const initialCity = resolveCity(sp.get("city"));
  const category = sp.get("category") || "";

  const mapRef = useRef<any>(null);
  const glRef = useRef<any>(null);
  const popupRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const readyRef = useRef(false);
  const [city, setCity] = useState(initialCity);
  const [count, setCount] = useState(0);
  const [contribCount, setContribCount] = useState(0);

  // init map + globe once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (mapRef.current || !containerRef.current) return;
      const gl = (await import("maplibre-gl")).default;
      glRef.current = gl;
      if (cancelled) return;

      const map = new gl.Map({
        container: containerRef.current,
        style: "https://tiles.openfreemap.org/styles/liberty",
        center: CITY_CENTERS[city],
        zoom: 2.4,            // start zoomed out -> globe visible
        attributionControl: false,
      });
      mapRef.current = map;
      popupRef.current = new gl.Popup({ offset: 14, closeButton: false, className: "biz-popup" });
      map.addControl(new gl.NavigationControl({ showCompass: false }), "bottom-right");

      map.on("style.load", () => {
        map.setProjection({ type: "globe" });          // round 3D earth
        try {
          map.setSky({
            "sky-color": "#0a1020",
            "horizon-color": "#1b2a4a",
            "fog-color": "#0a0f1a",
            "sky-horizon-blend": 0.6,
            "horizon-fog-blend": 0.6,
            "fog-ground-blend": 0.4,
            "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 0, 1, 6, 0.3, 10, 0],
          });
        } catch {}

        map.addSource("biz", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
        // soft glow
        map.addLayer({
          id: "biz-glow", type: "circle", source: "biz",
          paint: {
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 8, 7, 14, 16],
            "circle-color": MAP_YELLOW, "circle-blur": 1, "circle-opacity": 0.45,
          },
        });
        // solid dot
        map.addLayer({
          id: "biz-dot", type: "circle", source: "biz",
          paint: {
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 8, 3.5, 14, 7],
            "circle-color": MAP_YELLOW, "circle-stroke-width": 1.5, "circle-stroke-color": "#121212",
          },
        });

        map.on("click", "biz-dot", (e: any) => {
          const f = e.features?.[0]; if (!f) return;
          const p = f.properties || {};
          popupRef.current
            .setLngLat(f.geometry.coordinates)
            .setHTML(
              `<div style="font-family:sans-serif;min-width:170px">
                 <strong style="font-size:14px">${p.name || ""}</strong><br/>
                 <span style="font-size:12px;color:#666">${[p.category, p.location].filter(Boolean).join(" · ")}</span><br/>
                 ${p.phone ? `<span style="font-size:12px;color:#0a7">${p.phone}</span><br/>` : ""}
                 <a href="/${p.slug}" style="font-size:12px;color:#1a73e8">View →</a>
               </div>`)
            .addTo(map);
        });
        map.on("mouseenter", "biz-dot", () => (map.getCanvas().style.cursor = "pointer"));
        map.on("mouseleave", "biz-dot", () => (map.getCanvas().style.cursor = ""));

        // ── Contributions layer (people's local knowledge), green ──
        map.addSource("contrib", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
        map.addLayer({
          id: "contrib-glow", type: "circle", source: "contrib",
          paint: {
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 8, 8, 14, 18],
            "circle-color": MAP_GREEN, "circle-blur": 1, "circle-opacity": 0.5,
          },
        });
        map.addLayer({
          id: "contrib-dot", type: "circle", source: "contrib",
          paint: {
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 8, 4, 14, 8],
            "circle-color": MAP_GREEN, "circle-stroke-width": 1.5, "circle-stroke-color": "#121212",
          },
        });
        map.on("click", "contrib-dot", (e: any) => {
          const f = e.features?.[0]; if (!f) return;
          const p = f.properties || {};
          popupRef.current
            .setLngLat(f.geometry.coordinates)
            .setHTML(
              `<div style="font-family:sans-serif;min-width:180px">
                 <span style="font-size:10px;font-weight:700;color:#121212;background:#98aa9d;border-radius:5px;padding:1px 6px">${p.kindLabel || "Info"}</span><br/>
                 <strong style="font-size:14px;display:block;margin-top:5px">${p.title || ""}</strong>
                 <span style="font-size:12px;color:#555">${p.content || ""}</span><br/>
                 <span style="font-size:11px;color:#888">${[p.place_name, p.area].filter(Boolean).join(" · ")}</span>
                 ${p.price ? `<br/><span style="font-size:12px;color:#0a7">₹${p.price}</span>` : ""}
               </div>`)
            .addTo(map);
        });
        map.on("mouseenter", "contrib-dot", () => (map.getCanvas().style.cursor = "pointer"));
        map.on("mouseleave", "contrib-dot", () => (map.getCanvas().style.cursor = ""));

        readyRef.current = true;
        // smooth spin into the city
        map.flyTo({ center: CITY_CENTERS[city], zoom: 11.5, speed: 0.7, curve: 1.6 });
        loadCity(city);
      });
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line
  }, []);

  async function loadCity(c: string) {
    const map = mapRef.current; if (!map || !readyRef.current) return;
    const catQ = category ? `&category=${encodeURIComponent(category)}` : "";
    const res = await fetch(`/api/map?city=${encodeURIComponent(c)}${catQ}`);
    const data = await res.json();
    setCount(data.count || 0);
    const features = (data.businesses || [])
      .filter((b: any) => b.lat != null && b.lng != null)
      .map((b: any) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [b.lng, b.lat] },
        properties: { name: b.name, slug: b.slug, category: b.category, phone: b.phone, location: b.location },
      }));
    const src = map.getSource("biz");
    if (src) src.setData({ type: "FeatureCollection", features });

    // contributions for this city
    try {
      const cRes = await fetch(`/api/contributions/map?city=${encodeURIComponent(c)}`);
      const cData = await cRes.json();
      setContribCount(cData.count || 0);
      const cFeatures = (cData.contributions || [])
        .filter((x: any) => x.lat != null && x.lng != null)
        .map((x: any) => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: [x.lng, x.lat] },
          properties: {
            kindLabel: KIND_LABEL[x.kind] || "Info", title: x.title,
            content: x.content, place_name: x.place_name, area: x.area, price: x.price,
          },
        }));
      const cSrc = map.getSource("contrib");
      if (cSrc) cSrc.setData({ type: "FeatureCollection", features: cFeatures });
    } catch { setContribCount(0); }
  }

  // city change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    map.flyTo({ center: CITY_CENTERS[city], zoom: 11.5, speed: 0.8, curve: 1.5 });
    loadCity(city);
    // eslint-disable-next-line
  }, [city]);

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 82, background: BG }}>
      <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 5, display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "linear-gradient(#121212dd,#12121200)" }}>
        <span style={{ color: YELLOW, fontWeight: 700, fontSize: 16 }}>Map</span>
        <select value={city} onChange={(e) => setCity(e.target.value)} style={{ background: "var(--bg2)", color: FG, border: "1px solid var(--border)", borderRadius: 8, padding: "7px 10px", fontSize: 14, fontFamily: "inherit" }}>
          {Object.keys(CITY_CENTERS).map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <span style={{ color: YELLOW, fontSize: 13, fontWeight: 600 }}>{count} places</span>
        {contribCount > 0 && <span style={{ color: GREEN, fontSize: 13, fontWeight: 600 }}>· {contribCount} from people</span>}
      </div>
    </div>
  );
}
