"use client";

import { useEffect, useRef, useState } from "react";

const PDF_JS_VERSION = "5.4.624";
const SOUND_URL = "/page-turn.mp3";

type Props = {
  pdfUrl: string;
  title: string;
  limitPages: number;
};

type PDFDoc = import("pdfjs-dist").PDFDocumentProxy;

export default function MagazineFlipbook({ pdfUrl, title, limitPages }: Props) {
  const leftCanvasRef = useRef<HTMLCanvasElement>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribeOverlay, setSubscribeOverlay] = useState(false);
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [maxSpreadIndex, setMaxSpreadIndex] = useState(0);
  const pdfDocRef = useRef<PDFDoc | null>(null);
  const totalPagesRef = useRef(0);
  const maxSpreadIndexRef = useRef(0);
  const isRenderingRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const renderSpreadRef = useRef<((index: number) => void) | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    audioRef.current = SOUND_URL ? new Audio(SOUND_URL) : null;
    return () => {
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const leftCanvas = leftCanvasRef.current;
    const rightCanvas = rightCanvasRef.current;
    if (!leftCanvas || !rightCanvas || !pdfUrl) return;

    async function init() {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${PDF_JS_VERSION}/build/pdf.worker.min.mjs`;

      try {
        const loadingTask = pdfjsLib.getDocument({ url: pdfUrl });
        const pdf = await loadingTask.promise;
        if (cancelled) return;
        const totalPages = pdf.numPages;
        const maxP = limitPages > 0 ? Math.min(limitPages, totalPages) : totalPages;
        const maxSpreadIndex = maxP <= 1 ? 0 : Math.floor(maxP / 2);
        pdfDocRef.current = pdf;
        totalPagesRef.current = totalPages;
        maxSpreadIndexRef.current = maxSpreadIndex;
        if (!cancelled) {
          setTotalPages(totalPages);
          setMaxSpreadIndex(maxSpreadIndex);
        }

        const getMaxPage = () =>
          limitPages > 0 ? Math.min(limitPages, totalPagesRef.current) : totalPagesRef.current;

        const renderSpread = (index: number) => {
          const pdfDoc = pdfDocRef.current;
          if (!pdfDoc || isRenderingRef.current) return;
          isRenderingRef.current = true;
          const maxP = getMaxPage();

          if (index === 0) {
            leftCanvas!.width = 0;
            leftCanvas!.height = 0;
            pdfDoc.getPage(1).then((page) => {
              if (cancelled) return;
              const viewport = page.getViewport({ scale: 1.0 });
              const canvas = rightCanvas!;
              const ctx = canvas.getContext("2d")!;
              canvas.width = viewport.width;
              canvas.height = viewport.height;
              return page.render({ canvasContext: ctx, viewport, canvas }).promise;
            }).then(() => {
              if (!cancelled) {
                setSpreadIndex(0);
                isRenderingRef.current = false;
              }
            }).catch(() => {
              isRenderingRef.current = false;
            });
            return;
          }

          const leftPageNum = index * 2;
          const rightPageNum = index * 2 + 1;
          if (leftPageNum > maxP) {
            setSubscribeOverlay(true);
            isRenderingRef.current = false;
            return;
          }

          const scale = 1.0;
          const pdfPageNum = index + 1;

          if (pdfPageNum <= totalPagesRef.current) {
            pdfDoc.getPage(pdfPageNum).then((page) => {
              if (cancelled) return;
              const vp = page.getViewport({ scale });
              const w = vp.width;
              const h = vp.height;
              if (w >= h * 1.5) {
                const halfW = w / 2;
                const temp = document.createElement("canvas");
                temp.width = w;
                temp.height = h;
                const tCtx = temp.getContext("2d")!;
                return page.render({ canvasContext: tCtx, viewport: vp, canvas: temp }).promise.then(() => {
                  if (cancelled) return;
                  leftCanvas!.width = halfW;
                  leftCanvas!.height = h;
                  rightCanvas!.width = halfW;
                  rightCanvas!.height = h;
                  leftCanvas!.getContext("2d")!.drawImage(temp, 0, 0, halfW, h, 0, 0, halfW, h);
                  rightCanvas!.getContext("2d")!.drawImage(temp, halfW, 0, halfW, h, 0, 0, halfW, h);
                  setSpreadIndex(index);
                  isRenderingRef.current = false;
                });
              }
              return Promise.resolve(null);
            }).then((done: unknown) => {
              if (done === null && !cancelled) renderTwoPages(index, leftPageNum, rightPageNum, maxP, scale);
            }).catch(() => {
              if (!cancelled) renderTwoPages(index, leftPageNum, rightPageNum, maxP, scale);
            });
            return;
          }
          renderTwoPages(index, leftPageNum, rightPageNum, maxP, scale);
        }

        const renderTwoPages = (
          index: number,
          leftPageNum: number,
          rightPageNum: number,
          maxP: number,
          scale: number
        ) => {
          const pdfDoc = pdfDocRef.current;
          if (!pdfDoc) return;
          const promiseLeft = leftPageNum <= maxP ? pdfDoc.getPage(leftPageNum) : null;
          const promiseRight = rightPageNum <= maxP ? pdfDoc.getPage(rightPageNum) : null;
          const renderOne = (canvas: HTMLCanvasElement, page: import("pdfjs-dist").PDFPageProxy) => {
            const vp = page.getViewport({ scale });
            const ctx = canvas.getContext("2d")!;
            canvas.width = vp.width;
            canvas.height = vp.height;
            return page.render({ canvasContext: ctx, viewport: vp, canvas }).promise;
          };
          Promise.all([
            promiseLeft ? promiseLeft.then((p) => renderOne(leftCanvas!, p)) : Promise.resolve(),
            promiseRight ? promiseRight.then((p) => renderOne(rightCanvas!, p)) : Promise.resolve(),
          ]).then(() => {
            if (cancelled) return;
            if (rightPageNum > maxP) {
              rightCanvas!.width = 0;
              rightCanvas!.height = 0;
            }
            setSpreadIndex(index);
            isRenderingRef.current = false;
          }).catch(() => {
            isRenderingRef.current = false;
          });
        };

        renderSpreadRef.current = renderSpread;
        renderSpread(0);
        setLoading(false);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load PDF");
          setLoading(false);
        }
      }
    }

    init();
    return () => {
      cancelled = true;
      pdfDocRef.current = null;
      renderSpreadRef.current = null;
    };
  }, [pdfUrl, limitPages]);

  function playTurnSound() {
    const a = audioRef.current;
    if (a) {
      a.currentTime = 0;
      a.play().catch(() => {});
    }
  }

  const goPrev = () => {
    if (spreadIndex <= 0 || loading || isRenderingRef.current) return;
    playTurnSound();
    const nextIndex = spreadIndex - 1;
    renderSpreadRef.current?.(nextIndex);
  };

  const goNext = () => {
    const maxP = limitPages > 0 ? Math.min(limitPages, totalPagesRef.current) : totalPagesRef.current;
    if (spreadIndex >= maxSpreadIndexRef.current || loading || isRenderingRef.current) return;
    const nextIndex = spreadIndex + 1;
    if (nextIndex === 1 && 2 > maxP) {
      setSubscribeOverlay(true);
      return;
    }
    if (nextIndex > 1) {
      const rp = nextIndex * 2 + 1;
      if (rp > maxP) {
        setSubscribeOverlay(true);
        return;
      }
    }
    playTurnSound();
    renderSpreadRef.current?.(nextIndex);
  };

  const handlersRef = useRef({ goPrev, goNext });
  handlersRef.current = { goPrev, goNext };
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") {
        handlersRef.current.goPrev();
        e.preventDefault();
      }
      if (e.key === "ArrowRight") {
        handlersRef.current.goNext();
        e.preventDefault();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (error) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "var(--gold-dim)" }}>
        <p>Could not load PDF.</p>
        <a href={pdfUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--gold)" }}>
          Open PDF
        </a>
      </div>
    );
  }

  const maxP = limitPages > 0 ? Math.min(limitPages, totalPagesRef.current) : totalPagesRef.current;
  const pageInfo = spreadIndex === 0 ? "1" : `${spreadIndex * 2}–${Math.min(spreadIndex * 2 + 1, maxP)}`;

  return (
    <div className="fat-magazine-viewer" style={{ margin: "2em 0" }}>
      <h1 className="fat-magazine-single-title" style={{ fontSize: "1.5rem", color: "var(--gold)", marginBottom: "1rem" }}>
        {title}
      </h1>
      <div
        className={`fat-magazine-flipbook ${loading ? "fat-flipbook-loading" : ""}`}
        style={{
          minHeight: 500,
          background: "#2a2a2a",
          padding: "1rem",
          borderRadius: 8,
        }}
      >
        <div className="fat-flipbook-controls" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", marginBottom: "1rem" }}>
          <button
            type="button"
            className="fat-flip-prev"
            onClick={goPrev}
            disabled={loading || spreadIndex <= 0}
            style={{
              padding: "0.5rem 1rem",
              fontSize: "1.25rem",
              background: "#fff",
              border: "1px solid #ccc",
              borderRadius: 4,
              cursor: loading || spreadIndex <= 0 ? "not-allowed" : "pointer",
              opacity: loading || spreadIndex <= 0 ? 0.5 : 1,
            }}
          >
            ←
          </button>
          <span className="fat-flip-page-info" style={{ color: "#fff", fontSize: "1rem", minWidth: 80, textAlign: "center" }}>
            {loading ? "…" : `${pageInfo} / ${maxP}`}
          </span>
          <button
            type="button"
            className="fat-flip-next"
            onClick={goNext}
            disabled={loading || spreadIndex >= maxSpreadIndex}
            style={{
              padding: "0.5rem 1rem",
              fontSize: "1.25rem",
              background: "#fff",
              border: "1px solid #ccc",
              borderRadius: 4,
              cursor: loading || spreadIndex >= maxSpreadIndex ? "not-allowed" : "pointer",
              opacity: loading || spreadIndex >= maxSpreadIndex ? 0.5 : 1,
            }}
          >
            →
          </button>
        </div>
        <div className="fat-flipbook-pages" style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", minHeight: 400, position: "relative" }}>
          <div className="fat-flipbook-spread" style={{ display: "flex", flexDirection: "row", gap: 12, maxWidth: "100%", width: "100%", justifyContent: "center" }}>
            <div
              className={`fat-flipbook-left ${spreadIndex === 0 ? "fat-flipbook-empty" : ""}`}
              style={{
                flex: spreadIndex === 0 ? "0 0 0" : "0 1 50%",
                width: spreadIndex === 0 ? 0 : undefined,
                maxWidth: spreadIndex === 0 ? 0 : "50%",
                display: "flex",
                alignItems: "stretch",
                justifyContent: "center",
              }}
            >
              <div className="fat-flipbook-page-wrap" style={{ background: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.3)", overflow: "hidden", width: "100%", display: "flex", justifyContent: "center" }}>
                <canvas ref={leftCanvasRef} className="fat-flipbook-canvas" style={{ display: "block", maxWidth: "100%", height: "auto" }} />
              </div>
            </div>
            <div
              className="fat-flipbook-right"
              style={{ flex: spreadIndex === 0 ? "1 1 auto" : "0 1 50%", maxWidth: spreadIndex === 0 ? "100%" : "50%", display: "flex", alignItems: "stretch", justifyContent: "center" }}
            >
              <div className="fat-flipbook-page-wrap" style={{ background: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.3)", overflow: "hidden", width: "100%", display: "flex", justifyContent: "center" }}>
                <canvas ref={rightCanvasRef} className="fat-flipbook-canvas" style={{ display: "block", maxWidth: "100%", height: "auto" }} />
              </div>
            </div>
          </div>
        </div>
        {loading && (
          <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", color: "#fff", zIndex: 5 }}>
            Loading PDF…
          </div>
        )}
        <p className="fat-flipbook-hint" style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.875rem", textAlign: "center", marginTop: "1rem" }}>
          Use arrows or keyboard ← → to flip. Swipe on tablet.
        </p>
      </div>

      {subscribeOverlay && (
        <div
          id="fat-subscribe-overlay"
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={(e) => e.target === e.currentTarget && setSubscribeOverlay(false)}
        >
          <div
            className="fat-subscribe-popup"
            style={{
              background: "#fff",
              padding: "2rem",
              borderRadius: 8,
              maxWidth: 400,
              textAlign: "center",
              boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
            }}
          >
            <h3 style={{ margin: "0 0 0.5rem" }}>Subscribe to view the full magazine</h3>
            <p style={{ margin: "0 0 1.5rem", color: "#666" }}>
              Non-subscribers can view the first 6 pages. Subscribe for full access.
            </p>
            <a
              href="/subscribe"
              className="fat-subscribe-popup-btn"
              style={{ display: "inline-block", padding: "0.75rem 1.5rem", background: "#000", color: "#fff", borderRadius: 4, marginBottom: "0.75rem" }}
            >
              Subscribe
            </a>
            <br />
            <button
              type="button"
              className="fat-subscribe-close"
              onClick={() => setSubscribeOverlay(false)}
              style={{ margin: "0 auto", padding: "0.5rem 1rem", background: "transparent", border: "1px solid #ccc", borderRadius: 4, cursor: "pointer", fontSize: "0.875rem" }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
