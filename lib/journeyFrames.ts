// Shared frame cache and preloading manager for the LearnerPath scroll animation
export const TOTAL_JOURNEY_FRAMES = 191;

export type CachedFrame = ImageBitmap | HTMLImageElement;

// In-memory global cache for decoded frames
let globalFrames: (CachedFrame | null)[] = new Array(TOTAL_JOURNEY_FRAMES).fill(null);
let isFullyLoaded = false;
let isPreloadingStarted = false;
let activeFolder: string = "";

export function getJourneyFrames(): (CachedFrame | null)[] {
  return globalFrames;
}

export function isJourneyFramesLoaded(): boolean {
  return isFullyLoaded;
}

export function getJourneyFramePath(idx: number, isMobile: boolean): string {
  const dir = isMobile ? "/journey-frames-sm" : "/journey-frames";
  const frameNum = String(idx + 1).padStart(4, "0");
  return `${dir}/frame_${frameNum}.webp`;
}

/**
 * Preload all 191 scroll animation frames with controlled concurrency.
 * Tracks actual frame load completion and decodes to ImageBitmap for zero-latency canvas rendering.
 */
export async function preloadAllJourneyFrames(
  onProgress?: (loaded: number, total: number, percent: number) => void
): Promise<(CachedFrame | null)[]> {
  if (isFullyLoaded) {
    onProgress?.(TOTAL_JOURNEY_FRAMES, TOTAL_JOURNEY_FRAMES, 100);
    return globalFrames;
  }

  if (isPreloadingStarted) {
    // Already in progress; return a promise that waits until completion
    return new Promise((resolve) => {
      const check = setInterval(() => {
        if (isFullyLoaded) {
          clearInterval(check);
          resolve(globalFrames);
        }
      }, 50);
    });
  }

  isPreloadingStarted = true;

  const isMobile =
    typeof window !== "undefined"
      ? window.innerWidth < 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
      : false;

  activeFolder = isMobile ? "/journey-frames-sm" : "/journey-frames";

  let loadedCount = 0;
  const indices: number[] = Array.from({ length: TOTAL_JOURNEY_FRAMES }, (_, i) => i);
  const concurrency = 12; // 12 parallel requests for optimal throughput

  const updateProgress = () => {
    const pct = Math.min(100, Math.round((loadedCount / TOTAL_JOURNEY_FRAMES) * 100));
    onProgress?.(loadedCount, TOTAL_JOURNEY_FRAMES, pct);
  };

  async function loadFrame(index: number): Promise<void> {
    const url = getJourneyFramePath(index, isMobile);

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();

      if (typeof window !== "undefined" && "createImageBitmap" in window) {
        try {
          const bmp = await createImageBitmap(blob);
          globalFrames[index] = bmp;
        } catch {
          // Fallback to Image element if createImageBitmap fails
          await fallbackImage(blob, index);
        }
      } else {
        await fallbackImage(blob, index);
      }
    } catch {
      // Direct Image load fallback
      await new Promise<void>((resolve) => {
        if (typeof window === "undefined") {
          resolve();
          return;
        }
        const img = new Image();
        img.src = url;
        img.onload = () => {
          globalFrames[index] = img;
          resolve();
        };
        img.onerror = () => {
          // If a frame fails to load, fill from neighboring frame if available
          resolve();
        };
      });
    } finally {
      loadedCount++;
      updateProgress();
    }
  }

  function fallbackImage(blob: Blob, index: number): Promise<void> {
    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(blob);
      img.src = objectUrl;
      img.onload = () => {
        globalFrames[index] = img;
        URL.revokeObjectURL(objectUrl);
        resolve();
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve();
      };
    });
  }

  async function worker() {
    while (indices.length > 0) {
      const idx = indices.shift();
      if (idx !== undefined) {
        await loadFrame(idx);
      }
    }
  }

  // Initial progress notification
  updateProgress();

  // Run workers in parallel
  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  // Fill any gaps with nearest neighbor
  for (let i = 0; i < TOTAL_JOURNEY_FRAMES; i++) {
    if (!globalFrames[i]) {
      // Find nearest frame
      for (let offset = 1; offset < TOTAL_JOURNEY_FRAMES; offset++) {
        if (i - offset >= 0 && globalFrames[i - offset]) {
          globalFrames[i] = globalFrames[i - offset];
          break;
        }
        if (i + offset < TOTAL_JOURNEY_FRAMES && globalFrames[i + offset]) {
          globalFrames[i] = globalFrames[i + offset];
          break;
        }
      }
    }
  }

  isFullyLoaded = true;
  updateProgress();

  return globalFrames;
}
