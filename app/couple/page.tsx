"use client";

import { useState } from "react";
import { site } from "@/site.config";
import { getDemoStore } from "@/lib/client";

type Wish = { id: string; name: string; message: string; created_at: string };
type Photo = { id: string; name: string; url: string; created_at: string };

// The couple's private page: wishes and portraits, behind a password.
export default function CouplePage() {
  const [password, setPassword] = useState("");
  const [wishes, setWishes] = useState<Wish[] | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [demo, setDemo] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [zipping, setZipping] = useState(false);

  const load = async (pw: string) => {
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/couple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.status === 401) {
        setError("Wrong password.");
      } else if (j.configured === false) {
        // saving is not connected yet: show what this phone/browser saved while testing
        const s = getDemoStore();
        setDemo(true);
        setWishes(s.wishes);
        setPhotos(s.photos);
      } else if (r.ok) {
        setDemo(false);
        setWishes(j.wishes);
        setPhotos(j.photos);
      } else {
        setError("Something went wrong. Try again.");
      }
    } catch {
      setError("No connection. Try again.");
    }
    setBusy(false);
  };

  const downloadWishes = () => {
    const text = (wishes ?? [])
      .slice()
      .reverse()
      .map((w) => `${w.message}\n— ${w.name}\n`)
      .join("\n");
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "wishes.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const downloadPhotos = async () => {
    setZipping(true);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      let i = 1;
      for (const p of photos) {
        const blob = await (await fetch(p.url)).blob();
        const safe = p.name.replace(/[^\p{L}\p{N}_-]+/gu, "_").slice(0, 30) || "guest";
        zip.file(`${String(i).padStart(3, "0")}-${safe}.jpg`, blob);
        i++;
      }
      const out = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(out);
      const a = document.createElement("a");
      a.href = url;
      a.download = "portraits.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch {
      setError("Could not make the zip. Try again.");
    }
    setZipping(false);
  };

  return (
    <div className="coupleWrap">
      <h1>
        {site.names.first} &amp; {site.names.second}
      </h1>

      {wishes === null ? (
        <form
          className="coupleLogin"
          onSubmit={(e) => {
            e.preventDefault();
            if (password) load(password);
          }}
        >
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            aria-label="Password"
          />
          <button className="pill light" disabled={busy || !password} type="submit">
            {busy ? "…" : "Open"}
          </button>
          {error && <p className="camErr">{error}</p>}
        </form>
      ) : (
        <>
          {demo && <p className="demoNote">Demo mode: showing what this browser saved while testing. Connect Supabase to see real guests (see README).</p>}

          <h2>Wishes ({wishes.length})</h2>
          {wishes.length === 0 && <p className="coupleEmpty">No wishes yet.</p>}
          {wishes.map((w) => (
            <div key={w.id} className="coupleWish">
              <p>{w.message}</p>
              <small>— {w.name}</small>
            </div>
          ))}
          {wishes.length > 0 && (
            <button className="pill light" onClick={downloadWishes}>
              Download wishes
            </button>
          )}

          <h2>Portraits ({photos.length})</h2>
          {photos.length === 0 && <p className="coupleEmpty">No portraits yet.</p>}
          <div className="coupleGrid">
            {photos.map((p) => (
              <a key={p.id} className="couplePhoto" href={p.url} target="_blank" rel="noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt={`Portrait by ${p.name}`} loading="lazy" />
                <small>{p.name}</small>
              </a>
            ))}
          </div>
          {photos.length > 0 && (
            <button className="pill light" onClick={downloadPhotos} disabled={zipping}>
              {zipping ? "Preparing…" : "Download all portraits"}
            </button>
          )}
          {error && <p className="camErr">{error}</p>}

          <button className="miniLink" style={{ color: "var(--cream-dim)" }} onClick={() => load(password)}>
            Refresh
          </button>
        </>
      )}
    </div>
  );
}
