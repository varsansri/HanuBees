"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import styles from "./home.module.css";

type Item = {
  name: string;
  quantity: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fiber_g: number;
  fat_g: number;
};

type Analysis = {
  dish: string;
  cuisine: string;
  confidence: "high" | "medium" | "low";
  items: Item[];
  total: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fiber_g: number;
    fat_g: number;
  };
  notes: string;
};

const EXAMPLES = [
  "Idli & sambar",
  "Poha",
  "Masala dosa",
  "Dal & rice",
  "Chutney",
  "Paneer sabzi",
  "Roti",
];

export default function Home() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  function pick() {
    fileRef.current?.click();
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setResult(null);
    try {
      const shrunk = await downscale(file);
      setImage(shrunk);
    } catch {
      setError("Couldn't read that photo. Try another one.");
    }
  }

  async function analyze() {
    if (!image) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });
      const text = await res.text();
      let data: Analysis & { error?: string };
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          res.status === 413
            ? "That photo is too large. Try a smaller one."
            : "The server had a problem. Please try again.",
        );
      }
      if (!res.ok) throw new Error(data.error || "Could not analyze the photo.");
      setResult(data as Analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setImage(null);
    setResult(null);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className={styles.caloriePage}>
      <div className="wrap">
        <div className="topbar">
          <div className="brand">
            <span className="dot">🍛</span>
            Hanubees <small>calorie cam</small>
          </div>
          <Link className="design-library-link" href="/design">
            Design Library <span aria-hidden="true">→</span>
          </Link>
        </div>

        {!result && (
          <div className="hero">
            <h1>
              Snap your plate.<br />
              <b>Know every calorie.</b>
            </h1>
            <p>
              An AI calorie counter built for <b>Indian food</b> — idli, poha,
              sambar, chutney, dal, sabzi and the rest. Photo in, full nutrition out.
            </p>
            <div className="chips">
              {EXAMPLES.map((example) => (
                <span className="chip" key={example}>
                  {example}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="capture">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="preview" src={image} alt="Your food" />
          ) : (
            <div className="dropzone" onClick={pick}>
              <div>
                <div className="ic">📸</div>
                <h3>Take or upload a photo</h3>
                <span>Point at your meal — works best top-down</span>
              </div>
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden-input"
            onChange={onFile}
          />

          <div className="cap-actions">
            {image ? (
              <>
                <button className="btn btn-ghost" onClick={reset} disabled={loading}>
                  Retake
                </button>
                <button className="btn btn-primary" onClick={analyze} disabled={loading}>
                  {loading ? "Analyzing…" : "Analyze calories"}
                </button>
              </>
            ) : (
              <button className="btn btn-primary" onClick={pick}>
                Choose a photo
              </button>
            )}
          </div>
        </div>

        {loading && (
          <div className="loading">
            <div className="spinner" />
            <p>Reading your plate… identifying each item</p>
          </div>
        )}

        {error && <div className="err">{error}</div>}
        {result && <Result data={result} />}

        <div className="foot">
          <b>Hanubees</b> · AI nutrition for Indian food
        </div>
      </div>
    </div>
  );
}

function Result({ data }: { data: Analysis }) {
  const total = data.total;
  const macroTotal = Math.max(1, total.protein_g + total.carbs_g + total.fat_g);
  const percentage = (grams: number) => `${Math.round((grams / macroTotal) * 100)}%`;

  return (
    <div className="result">
      <div className="dish-name">{data.dish}</div>
      <div className="dish-sub">
        {data.cuisine && <span>{data.cuisine}</span>}
        <span className={`conf ${data.confidence}`}>
          {data.confidence} confidence
        </span>
      </div>

      <div className="macros">
        <div className="macro cal">
          <div className="v">
            {Math.round(total.calories)}<span>kcal</span>
          </div>
          <div className="k">Total calories</div>
        </div>
        <div className="macro">
          <div className="v">{round(total.protein_g)}<span>g</span></div>
          <div className="k">Protein</div>
          <div className="bar"><i style={{ width: percentage(total.protein_g), background: "var(--green)" }} /></div>
        </div>
        <div className="macro">
          <div className="v">{round(total.carbs_g)}<span>g</span></div>
          <div className="k">Carbs</div>
          <div className="bar"><i style={{ width: percentage(total.carbs_g), background: "var(--saffron)" }} /></div>
        </div>
        <div className="macro">
          <div className="v">{round(total.fiber_g)}<span>g</span></div>
          <div className="k">Fiber</div>
          <div className="bar"><i style={{ width: percentage(total.fiber_g), background: "var(--green2)" }} /></div>
        </div>
        <div className="macro">
          <div className="v">{round(total.fat_g)}<span>g</span></div>
          <div className="k">Fat</div>
          <div className="bar"><i style={{ width: percentage(total.fat_g), background: "#e0a800" }} /></div>
        </div>
      </div>

      {data.items?.length > 0 && (
        <>
          <div className="section-t">On your plate</div>
          <div className="items">
            {data.items.map((item, index) => (
              <div className="item" key={index}>
                <div>
                  <div className="nm">{item.name}</div>
                  <div className="qt">
                    {item.quantity} · P {round(item.protein_g)}g · C {round(item.carbs_g)}g · Fb {round(item.fiber_g)}g
                  </div>
                </div>
                <div className="cal">{Math.round(item.calories)} <small>kcal</small></div>
              </div>
            ))}
          </div>
        </>
      )}

      {data.notes && <div className="note">{data.notes}</div>}

      <div className="disclaimer">
        Estimates are AI-generated from a single photo and can vary with portion
        size, oil and ingredients. Use as a guide, not medical advice.
      </div>
    </div>
  );
}

function round(value: number) {
  return Math.round((value ?? 0) * 10) / 10;
}

// Resize big phone photos in the browser so the request stays well under
// the server's body limit (and uploads/analyses faster).
function downscale(file: File, maxDim = 1280, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxDim / Math.max(image.width, image.height));
      const width = Math.round(image.width * scale);
      const height = Math.round(image.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) return reject(new Error("no canvas"));
      context.drawImage(image, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("bad image"));
    };
    image.src = url;
  });
}
