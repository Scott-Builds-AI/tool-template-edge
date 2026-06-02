"use client";

import { useState, useTransition } from "react";

/**
 * Client-side button that triggers the server-side `/api/demo-fetch` route.
 * The route is where the actual SDK call lives — running it server-side
 * means the JWT cookie is automatically attached and the plaintext key
 * never reaches the browser.
 */
export function DemoFetchButton() {
  const [result, setResult] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      try {
        const res = await fetch("/api/demo-fetch", { method: "POST" });
        const data = (await res.json()) as { ok?: boolean; message?: string };
        if (res.ok) {
          setResult(`OK — ${data.message ?? "fetch succeeded"}`);
        } else {
          setResult(`${res.status} — ${data.message ?? "fetch failed"}`);
        }
      } catch (err) {
        setResult(`network error: ${err instanceof Error ? err.message : "unknown"}`);
      }
    });
  }

  return (
    <div>
      <button
        type="button"
        className="tool-button"
        disabled={pending}
        onClick={handleClick}
      >
        {pending ? "Fetching…" : "Fetch & use OpenAI key"}
      </button>
      {result ? <p className="tool-result">{result}</p> : null}
    </div>
  );
}
