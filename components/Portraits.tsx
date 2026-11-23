"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/site.config";
import { Reveal } from "./Reveal";
import { MAX_PHOTOS, addOwnPhoto, getOwnPhotos, getSavedName, getStatus, sendPhoto, setSavedName, type OwnPhoto } from "@/lib/client";
import { Vines } from "./Vines";

const OUT_W = 1200;
const OUT_H = 1600; // 3:4 portrait

type Step = "name" | "live" | "fallback" | "review";

/** Draws any image/video into a 3:4 portrait canvas (centre crop). */
function toPortraitCanvas(src: CanvasImageSource, sw: number, sh: number, mirror: boolean, film: boolean) {
  const c = document.createElement("canvas");
  c.width = OUT_W;
  c.height = OUT_H;
  const ctx = c.getContext("2d")!;
  const target = OUT_W / OUT_H;
  let cw = sw;
  let ch = sh;
  if (sw / sh > target) cw = sh * target;
  else ch = sw / target;
  const cx = (sw - cw) / 2;
  const cy = (sh - ch) / 2;
  if (mirror) {
    ctx.translate(OUT_W, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(src, cx, cy, cw, ch, 0, 0, OUT_W, OUT_H);
  if (mirror) ctx.setTransform(1, 0, 0, 1, 0, 0);

  if (film) {
    // soft warm black-and-white
    const img = ctx.getImageData(0, 0, OUT_W, OUT_H);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      let g = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
      g = (g - 128) * 1.08 + 128;
      g = g < 0 ? 0 : g > 255 ? 255 : g;
      d[i] = Math.min(255, g * 1.03);
      d[i + 1] = g;
      d[i + 2] = g * 0.93;
    }
    ctx.putImageData(img, 0, 0);
  }
  return c;
}

function canvasToBlob(c: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => c.toBlob((b) => (b ? resolve(b) : reject(new Error("blob"))), "image/jpeg", 0.86));
}

function thumbOf(c: HTMLCanvasElement): string {
  const t = document.createElement("canvas");
  t.width = 240;
  t.height = 320;
  t.getContext("2d")!.drawImage(c, 0, 0, 240, 320);
  return t.toDataURL("image/jpeg", 0.7);
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 120 92" width="104" height="80" aria-hidden="true">
      <defs>
        <radialGradient id="lens" cx="0.38" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#e2574b" />
          <stop offset="0.55" stopColor="#c53a30" />
          <stop offset="1" stopColor="#7d1f18" />
        </radialGradient>
      </defs>
      <rect x="82" y="8" width="14" height="9" rx="2" fill="#2c4a96" />
      <rect x="6" y="18" width="108" height="68" rx="9" fill="#f3efe4" stroke="#2c4a96" strokeWidth="1.6" />
      <rect x="6" y="18" width="108" height="20" rx="9" fill="#f3efe4" stroke="#2c4a96" strokeWidth="1.6" />
      <rect x="15" y="24" width="20" height="9" rx="2" fill="#ffffff" stroke="#2c4a96" strokeWidth="1.2" />
      <circle cx="100" cy="28" r="3" fill="#2c4a96" />
      <circle cx="60" cy="58" r="23" fill="#ffffff" stroke="#2c4a96" strokeWidth="1.6" />
      <circle cx="60" cy="58" r="17" fill="url(#lens)" />
      <circle cx="53" cy="51" r="4" fill="#fff" fillOpacity="0.28" />
    </svg>
  );
}

function CameraOverlay({ startLeft, onClose, onSaved }: { startLeft: number; onClose: () => void; onSaved: () => void }) {
  const [step, setStep] = useState<Step>(getSavedName() ? "live" : "name");
  const [name, setName] = useState(getSavedName());
  const [facing, setFacing] = useState<"user" | "environment">("user");
  const [film, setFilm] = useState(false);
  const [left, setLeft] = useState(startLeft);
  const [photoUrl, setPhotoUrl] = useState("");
  const [save, setSave] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [err, setErr] = useState("");
  const [flash, setFlash] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const pending = useRef<{ blob: Blob; thumb: string } | null>(null);

  // keep the page behind from scrolling
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // live camera
  useEffect(() => {
    if (step !== "live") return;
    let cancelled = false;
    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("no camera api");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facing }, width: { ideal: 1440 }, height: { ideal: 1920 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const v = videoRef.current;
        if (v) {
          v.srcObject = stream;
          await v.play().catch(() => {});
        }
      } catch {
        if (!cancelled) {
          setUseFallback(true);
          setStep("fallback");
        }
      }
    })();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [step, facing]);

  const upload = async () => {
    const p = pending.current;
    if (!p) return;
    setSave("saving");
    setErr("");
    const res = await sendPhoto(p.blob, p.thumb, name);
    if (res.ok) {
      addOwnPhoto({ thumb: p.thumb, at: Date.now() });
      pending.current = null;
      setLeft((l) => Math.max(0, l - 1));
      setSave("saved");
      onSaved();
    } else {
      setSave("error");
      setErr(res.error || "Could not save.");
    }
  };

  const finishShot = async (canvas: HTMLCanvasElement) => {
    const blob = await canvasToBlob(canvas);
    const thumb = thumbOf(canvas);
    pending.current = { blob, thumb };
    setPhotoUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return URL.createObjectURL(blob);
    });
    setStep("review");
    upload();
  };

  const shoot = async () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    setFlash(true);
    setTimeout(() => setFlash(false), 450);
    const canvas = toPortraitCanvas(v, v.videoWidth, v.videoHeight, facing === "user", film);
    await finishShot(canvas);
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = async () => {
      const canvas = toPortraitCanvas(img, img.naturalWidth, img.naturalHeight, false, film);
      URL.revokeObjectURL(url);
      await finishShot(canvas);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setErr("That photo could not be opened.");
    };
    img.src = url;
  };

  const another = () => {
    setSave("idle");
    setStep(useFallback ? "fallback" : "live");
  };

  const close = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    onClose();
  };

  return (
    <div className="camOverlay" role="dialog" aria-modal="true" aria-label={site.text.cameraTitle}>
      <button className="camClose" onClick={close} aria-label="Close">
        ×
      </button>

      {step === "name" && (
        <div className="camPanel">
          <h3 className="camTitle">What is your name?</h3>
          <p className="camSub">So the couple knows who took each photo.</p>
          <input
            className="camInput"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            placeholder={site.text.wishNamePlaceholder}
            autoComplete="name"
          />
          <button
            className="pill light"
            disabled={!name.trim()}
            onClick={() => {
              setSavedName(name);
              setStep("live");
            }}
          >
            {site.text.cameraOpen}
          </button>
        </div>
      )}

      {step === "fallback" && (
        <div className="camPanel">
          <h3 className="camTitle">{site.text.cameraTitle}</h3>
          <p className="camSub">
            This browser will not show a live camera here, but your phone can still take the photo.
            <br />
            <br />
            Tip: opening the link in Safari or Chrome gives the live camera.
          </p>
          <button className="pill light" onClick={() => fileRef.current?.click()}>
            {site.text.cameraOpen}
          </button>
          {err && <p className="camErr">{err}</p>}
          <p className="camLeft">{site.text.shotsLeft(left)}</p>
        </div>
      )}

      {step === "live" && (
        <div className="camLive">
          <div className="camTop">
            <span className="camLeft">{site.text.shotsLeft(left)}</span>
            <button className="camFlip" onClick={() => setFacing((f) => (f === "user" ? "environment" : "user"))}>
              FLIP
            </button>
          </div>
          <div className="viewfinder">
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className={`${facing === "user" ? "mirror" : ""} ${film ? "filmLook" : ""}`}
            />
            <div className="vfCorners" aria-hidden="true" />
          </div>
          <div className="camBottom">
            <div className="lookToggle">
              <button className={!film ? "on" : ""} onClick={() => setFilm(false)}>
                NATURAL
              </button>
              <button className={film ? "on" : ""} onClick={() => setFilm(true)}>
                FILM
              </button>
            </div>
            <button className="shutter" onClick={shoot} aria-label="Take the photo">
              <i />
            </button>
          </div>
        </div>
      )}

      {step === "review" && (
        <div className="camLive review">
          <div className="camTop">
            <span className="camLeft">{site.text.shotsLeft(left)}</span>
          </div>
          <div className="viewfinder developed">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoUrl} alt="Your photo" className="develop" />
          </div>
          <div className="camBottom">
            <div className="saveState" aria-live="polite">
              {save === "saving" && "Saving…"}
              {save === "saved" && "Saved. The couple will see it."}
              {save === "error" && <span className="camErr">{err}</span>}
            </div>
            <div className="reviewBtns">
              {save === "error" && (
                <button className="pill light" onClick={upload}>
                  Try again
                </button>
              )}
              {save === "saved" && left > 0 && (
                <button className="pill light" onClick={another}>
                  Another shot
                </button>
              )}
              {save === "saved" && (
                <button className="pill ghost" onClick={close}>
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" capture="user" hidden onChange={onFile} />
      {flash && <div className="flash" aria-hidden="true" />}
    </div>
  );
}

export function Portraits() {
  const [open, setOpen] = useState(false);
  const [own, setOwn] = useState<OwnPhoto[]>([]);
  const [configured, setConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    setOwn(getOwnPhotos());
    getStatus().then((s) => setConfigured(s.configured));
  }, []);

  const left = Math.max(0, MAX_PHOTOS - own.length);

  return (
    <section className="portraits paper vined" aria-label={site.text.cameraTitle}>
      <Vines seed={4} />
      <Reveal>
        <h2 className="eyebrow ink">{site.text.cameraTitle}</h2>
        <div className="ar titleAr">{site.text.ar.camera}</div>
        <p className="lede ink">{site.text.cameraSub}</p>
      </Reveal>

      <Reveal delay={120}>
        <button className="camButton" onClick={() => left > 0 && setOpen(true)} disabled={left === 0} aria-label={site.text.cameraOpen}>
          <CameraIcon />
        </button>
        <div className="camCaption">{left > 0 ? site.text.cameraOpen : "That is your three. Thank you."}</div>
      </Reveal>

      <Reveal delay={200}>
        <div className="frames">
          {Array.from({ length: MAX_PHOTOS }).map((_, i) => (
            <div key={i} className={`frame ${own[i] ? "filled" : ""}`}>
              {own[i] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={own[i].thumb} alt={`Your photo ${i + 1}`} />
              ) : (
                <span>{i + 1}</span>
              )}
            </div>
          ))}
        </div>
        <div className="frameCount">{site.text.shotsLeft(left)}</div>
      </Reveal>

      {configured === false && <p className="demoNote ink">Demo mode: photos stay on this phone until Supabase is connected (see README).</p>}

      {open && <CameraOverlay startLeft={left} onClose={() => setOpen(false)} onSaved={() => setOwn(getOwnPhotos())} />}
    </section>
  );
}
