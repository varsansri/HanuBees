"use client";

import { useState } from "react";

export function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="code-block">
      <div className="code-block__bar">
        <div>
          <span className="code-dot code-dot--red" />
          <span className="code-dot code-dot--yellow" />
          <span className="code-dot code-dot--green" />
        </div>
        <span>shopify-section.liquid</span>
        <button type="button" onClick={copyCode} aria-live="polite">
          {copied ? "Copied" : "Copy code"}
        </button>
      </div>
      <pre tabIndex={0}>
        <code>{code}</code>
      </pre>
    </div>
  );
}
