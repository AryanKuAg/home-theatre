'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import ScrollyVideoController from 'scrolly-video/dist/ScrollyVideo.js';

const heroVideo =
  'https://sites.framerate.space/template-assets/home-theatre/hero.mp4';

class SmoothScrollyVideo extends ScrollyVideoController {
  private lastPaintedFrame = -1;

  override async decodeVideo() {
    if (
      this.video.readyState < HTMLMediaElement.HAVE_METADATA ||
      !Number.isFinite(this.video.duration)
    ) {
      await new Promise<void>((resolve) => {
        const finish = () => {
          this.video.removeEventListener('loadedmetadata', finish);
          this.video.removeEventListener('error', finish);
          resolve();
        };

        this.video.addEventListener('loadedmetadata', finish, { once: true });
        this.video.addEventListener('error', finish, { once: true });
      });
    }

    await super.decodeVideo();
  }

  override paintCanvasFrame(frameNumber: number) {
    const frameIndex = Math.max(
      0,
      Math.min(this.frames.length - 1, frameNumber),
    );
    const frame = this.frames[frameIndex] as ImageBitmap | undefined;

    if (
      !this.canvas ||
      !this.context ||
      !frame ||
      frameIndex === this.lastPaintedFrame
    ) {
      return;
    }

    if (this.canvas.width !== frame.width || this.canvas.height !== frame.height) {
      this.canvas.width = frame.width;
      this.canvas.height = frame.height;
    }

    this.context.drawImage(frame, 0, 0, frame.width, frame.height);
    this.lastPaintedFrame = frameIndex;
  }
}

function ScrollyHero({ onReady }: { onReady: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const readyRef = useRef(false);

  const markReady = useCallback(() => {
    if (readyRef.current) return;
    readyRef.current = true;
    onReady();
  }, [onReady]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let controller: SmoothScrollyVideo | null = null;
    let destroyed = false;
    readyRef.current = false;

    const revealWhenVisible = () => {
      if (destroyed || !controller) return;

      const { video, canvas, frames } = controller;

      if (canvas && frames.length > 0) {
        const duration = video.duration;
        if (Number.isFinite(duration) && duration > 0) {
          controller.frameRate = frames.length / duration;
          controller.updateScrollPercentage(true);
          controller.paintCanvasFrame(
            Math.floor(controller.currentTime * controller.frameRate),
          );
        }

        window.requestAnimationFrame(markReady);
        return;
      }

      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        window.requestAnimationFrame(markReady);
      } else {
        video.addEventListener('loadeddata', markReady, { once: true });
        video.addEventListener('canplay', markReady, { once: true });
      }
    };

    controller = new SmoothScrollyVideo({
      src: heroVideo,
      scrollyVideoContainer: container,
      sticky: true,
      full: true,
      cover: true,
      trackScroll: true,
      lockScroll: false,
      transitionSpeed: 64,
      frameThreshold: 1 / 60,
      useWebCodecs: true,
      onReady: revealWhenVisible,
    });

    return () => {
      destroyed = true;
      controller?.destroy();
    };
  }, [markReady]);

  return (
    <div className="hero-track">
      <div ref={containerRef} data-scrolly-container />
    </div>
  );
}

export default function Home() {
  const [siteReady, setSiteReady] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const isReady = siteReady && videoReady;

  // Never let the hero strand the page on its loading screen. The film is
  // fetched over the network, so "ready" depends on the visitor's connection
  // and may simply never arrive — and without this the site never shows itself
  // at all. Same guard the other templates in this set use.
  useEffect(() => {
    const film = window.setTimeout(() => setVideoReady(true), 6000);
    const reveal = window.setTimeout(() => setSiteReady(true), 9000);
    return () => {
      window.clearTimeout(film);
      window.clearTimeout(reveal);
    };
  }, []);
  const handleVideoReady = useCallback(() => setVideoReady(true), []);

  useEffect(() => {
    let cancelled = false;

    const markSiteReady = () => {
      const fontsReady = document.fonts?.ready ?? Promise.resolve();

      void fontsReady.then(() => {
        window.requestAnimationFrame(() => {
          if (!cancelled) setSiteReady(true);
        });
      });
    };

    if (document.readyState === 'complete') {
      markSiteReady();
    } else {
      window.addEventListener('load', markSiteReady, { once: true });
    }

    return () => {
      cancelled = true;
      window.removeEventListener('load', markSiteReady);
    };
  }, []);

  return (
    <>
      <main className={`site-shell${isReady ? ' is-ready' : ''}`} aria-busy={!isReady}>
      <header className="site-nav">
        <a className="wordmark" href="#top" aria-label="Atelier Noir home">
          ATELIER NOIR
        </a>
      </header>

      <section className="hero-scroll" id="top" aria-label="Atelier Noir introduction">
        <ScrollyHero onReady={handleVideoReady} />

        <div className="hero-stage">
          <div className="hero-shade" aria-hidden="true" />

          <div className="hero-content">
            <h1>YOUR CINEMA.<br />BUILT AT HOME.</h1>
            <p>Immersive sound, perfect picture, and spaces designed around the way you watch.</p>
            <a className="text-cta" href="mailto:studio@ateliernoir.example">
              BUILD YOUR THEATRE <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </section>
      </main>

      <div
        className={`loading-screen${isReady ? ' is-complete' : ''}`}
        role="status"
        aria-live="polite"
        aria-label="Loading Atelier Noir"
        aria-hidden={isReady}
      >
        <div className="loading-screen__top">
          <span>ATELIER NOIR</span>
          <span className="loading-screen__muted">PRIVATE CINEMA / 01</span>
        </div>

        <div className="loading-screen__center">
          <span className="loading-screen__eyebrow">PREPARING THE ROOM</span>
          <span className="loading-screen__title">A private cinema, precisely made.</span>
        </div>

        <div className="loading-screen__bottom">
          <span className="loading-screen__muted">LOADING EXPERIENCE</span>
          <span className="loading-screen__indicator" aria-hidden="true" />
        </div>
      </div>
    </>
  );
}
