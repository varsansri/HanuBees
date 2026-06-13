"use client";

import { useRef, useState } from "react";

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

const EXAMPLES = ["Idli & sambar", "Poha", "Masala dosa", "Dal & rice", "Chutney", "Paneer sabzi", "Roti"];

export default function Home() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  function pick() {
    fileRef.current?.click();
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setResult(null);
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
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
      const data = await res.json();
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
    <div className="wrap">
      <div className="topbar">
        <div className="brand">
          <span className="dot">🍛</span>
          Hanubees <small>calorie cam</small>
        </div>
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
            {EXAMPLES.map((e) => (
              <span className="chip" key={e}>{e}</span>
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
  );
}

function Result({ data }: { data: Analysis }) {
  const t = data.total;
  const macroTotal = Math.max(1, t.protein_g + t.carbs_g + t.fat_g);
  const pct = (g: number) => `${Math.round((g / macroTotal) * 100)}%`;

  return (
    <div className="result">
      <div className="dish-name">{data.dish}</div>
      <div className="dish-sub">
        {data.cuisine && <span>{data.cuisine}</span>}
        <span className={`conf ${data.confidence}`}>{data.confidence} confidence</span>
      </div>

      <div className="macros">
        <div className="macro cal">
          <div className="v">{Math.round(t.calories)}<span>kcal</span></div>
          <div className="k">Total calories</div>
        </div>
        <div className="macro">
          <div className="v">{round(t.protein_g)}<span>g</span></div>
          <div className="k">Protein</div>
          <div className="bar"><i style={{ width: pct(t.protein_g), background: "var(--green)" }} /></div>
        </div>
        <div className="macro">
          <div className="v">{round(t.carbs_g)}<span>g</span></div>
          <div className="k">Carbs</div>
          <div className="bar"><i style={{ width: pct(t.carbs_g), background: "var(--saffron)" }} /></div>
        </div>
        <div className="macro">
          <div className="v">{round(t.fiber_g)}<span>g</span></div>
          <div className="k">Fiber</div>
          <div className="bar"><i style={{ width: pct(t.fiber_g), background: "var(--green2)" }} /></div>
        </div>
        <div className="macro">
          <div className="v">{round(t.fat_g)}<span>g</span></div>
          <div className="k">Fat</div>
          <div className="bar"><i style={{ width: pct(t.fat_g), background: "#e0a800" }} /></div>
        </div>
      </div>

      {data.items?.length > 0 && (
        <>
          <div className="section-t">On your plate</div>
          <div className="items">
            {data.items.map((it, i) => (
              <div className="item" key={i}>
                <div>
                  <div className="nm">{it.name}</div>
                  <div className="qt">
                    {it.quantity} · P {round(it.protein_g)}g · C {round(it.carbs_g)}g · Fb {round(it.fiber_g)}g
                  </div>
                </div>
                <div className="cal">{Math.round(it.calories)} <small>kcal</small></div>
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

function round(n: number) {
  return Math.round((n ?? 0) * 10) / 10;
}
