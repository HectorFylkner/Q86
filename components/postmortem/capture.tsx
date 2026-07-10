"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import {
  Camera,
  ClipboardText,
  UploadSimple,
  X,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const MAX_IMAGES = 3;
const MAX_LONG_EDGE = 1568;
const JPEG_QUALITY = 0.8;

async function toCompressedDataUrl(file: File | Blob): Promise<string> {
  const asFile =
    file instanceof File
      ? file
      : new File([file], "capture.jpg", { type: "image/jpeg" });
  const compressed = await imageCompression(asFile, {
    maxWidthOrHeight: MAX_LONG_EDGE,
    initialQuality: JPEG_QUALITY,
    fileType: "image/jpeg",
    useWebWorker: true,
  });
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(compressed);
  });
}

/**
 * Scratch-work capture: webcam still (preview/retake), drag-drop upload,
 * clipboard paste. Everything is compressed client-side (max long edge
 * 1568 px, JPEG ~0.8) before it leaves the browser. Up to 3 images.
 */
export function ScratchCapture({
  images,
  onChange,
  disabled,
}: {
  images: string[];
  onChange: React.Dispatch<React.SetStateAction<string[]>>;
  disabled?: boolean;
}) {
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraSessionRef = useRef(0);

  const full = images.length >= MAX_IMAGES;

  const addBlobs = useCallback(
    async (blobs: (File | Blob)[]) => {
      if (disabled) return;
      setBusy(true);
      try {
        const added: string[] = [];
        for (const blob of blobs.slice(0, MAX_IMAGES)) {
          added.push(await toCompressedDataUrl(blob));
        }
        if (added.length > 0) {
          // Functional update: concurrent adds (paste during an upload's
          // compression) append to the latest list instead of clobbering
          // it, and the cap holds regardless of interleaving.
          onChange((prev) => [...prev, ...added].slice(0, MAX_IMAGES));
        }
      } finally {
        setBusy(false);
      }
    },
    [onChange, disabled],
  );

  // Clipboard paste anywhere on the page.
  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      if (disabled || full) return;
      const files = Array.from(e.clipboardData?.items ?? [])
        .filter((item) => item.type.startsWith("image/"))
        .map((item) => item.getAsFile())
        .filter((f): f is File => f != null);
      if (files.length > 0) void addBlobs(files);
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [addBlobs, disabled, full]);

  async function openCamera() {
    setCameraError(null);
    const session = ++cameraSessionRef.current;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 } },
      });
      if (cameraSessionRef.current !== session) {
        // Closed or unmounted while waiting for permission — release it.
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;
      setCameraOpen(true);
    } catch {
      setCameraError(
        "Camera unavailable or permission denied — upload a photo or paste from the clipboard instead.",
      );
    }
  }

  useEffect(() => {
    if (cameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraOpen]);

  function closeCamera() {
    cameraSessionRef.current++;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOpen(false);
  }

  useEffect(() => closeCamera, []);

  async function captureStill() {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.92),
    );
    if (blob) await addBlobs([blob]);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={cameraOpen ? closeCamera : openCamera}
          disabled={disabled || (full && !cameraOpen)}
          className={cn(
            "flex items-center gap-1.5 rounded-control border border-grid bg-surface px-3 py-1.5 text-sm hover:border-graphite/50",
            (disabled || (full && !cameraOpen)) && "opacity-50",
          )}
        >
          <Camera size={14} weight="regular" aria-hidden />
          {cameraOpen ? "Close camera" : "Use the webcam"}
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || full}
          className={cn(
            "flex items-center gap-1.5 rounded-control border border-grid bg-surface px-3 py-1.5 text-sm hover:border-graphite/50",
            (disabled || full) && "opacity-50",
          )}
        >
          <UploadSimple size={14} weight="regular" aria-hidden />
          Upload a photo
        </button>
        <span className="flex items-center gap-1.5 text-xs text-graphite">
          <ClipboardText size={13} weight="regular" aria-hidden />
          or paste from the clipboard
        </span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length > 0) void addBlobs(files);
            e.target.value = "";
          }}
        />
      </div>

      {cameraError && <p className="text-sm text-redpen">{cameraError}</p>}

      {cameraOpen && (
        <div className="space-y-2 rounded-card border border-grid bg-surface p-3 shadow-ambient">
          {/* Live camera preview; stills are captured to canvas */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full rounded-control"
          />
          <div className="flex gap-2">
            <button
              onClick={captureStill}
              disabled={busy || full}
              className={cn(
                "rounded-control bg-ballpoint px-4 py-1.5 text-sm font-medium text-white hover:bg-ballpoint/90",
                (busy || full) && "opacity-50",
              )}
            >
              Capture this frame
            </button>
            {full && (
              <span className="self-center text-xs text-graphite">
                3 images max — remove one to retake.
              </span>
            )}
          </div>
        </div>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const files = Array.from(e.dataTransfer.files).filter((f) =>
            f.type.startsWith("image/"),
          );
          if (files.length > 0) void addBlobs(files);
        }}
        className={cn(
          "flex min-h-24 items-center justify-center rounded-card border border-dashed p-3 text-sm transition-colors duration-150",
          dragOver ? "border-ballpoint bg-highlight/50" : "border-grid",
        )}
      >
        {images.length === 0 ? (
          <span className="text-graphite">
            Drop photos of your scratch work here ({MAX_IMAGES} max)
          </span>
        ) : (
          <div className="flex flex-wrap gap-3">
            {images.map((src, i) => (
              <div key={i} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Scratch work ${i + 1}`}
                  className="h-28 rounded-control border border-grid object-contain"
                />
                {!disabled && (
                  <button
                    onClick={() => onChange((prev) => prev.filter((_, j) => j !== i))}
                    aria-label={`Remove image ${i + 1}`}
                    className="absolute -right-2 -top-2 rounded-full border border-grid bg-surface p-0.5 text-graphite hover:text-redpen"
                  >
                    <X size={13} weight="regular" aria-hidden />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {busy && <p className="text-xs text-graphite">Compressing…</p>}
    </div>
  );
}
