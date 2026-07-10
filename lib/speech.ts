/* Browser speech-to-text + audio capture. No API keys required — uses the
 * Web Speech API (Chrome/Edge/Safari) for live transcription and MediaRecorder
 * to capture the audio blob. Degrades gracefully when either is unavailable. */

/* eslint-disable @typescript-eslint/no-explicit-any */

export function speechSupported(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition,
  );
}

export type CaptureResult = {
  transcript: string;
  confidence: number | null;
  durationSeconds: number;
  audio: Blob | null;
  source: string;
};

export type CaptureHandle = {
  stop: () => Promise<CaptureResult>;
  onInterim?: (text: string) => void;
};

type StartOptions = {
  lang?: string;
  onInterim?: (liveText: string) => void;
};

/**
 * Start capturing. Returns a handle whose stop() resolves with the final
 * transcript + audio blob. Requests mic permission for audio capture; if that
 * fails we still try speech recognition (which manages its own mic).
 */
export async function startCapture(opts: StartOptions = {}): Promise<CaptureHandle> {
  const startedAt = Date.now();

  // --- audio capture (best effort) ---
  let mediaRecorder: MediaRecorder | null = null;
  let stream: MediaStream | null = null;
  const chunks: BlobPart[] = [];
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    mediaRecorder.start();
  } catch {
    mediaRecorder = null;
  }

  // --- speech recognition (best effort) ---
  const SR =
    (typeof window !== "undefined" &&
      ((window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition)) ||
    null;

  let recognition: any = null;
  let finalText = "";
  let bestConfidence: number | null = null;

  if (SR) {
    recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = opts.lang || navigator.language || "en-US";
    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        const alt = res[0];
        if (res.isFinal) {
          finalText += (finalText ? " " : "") + alt.transcript.trim();
          if (typeof alt.confidence === "number" && alt.confidence > 0) {
            bestConfidence =
              bestConfidence === null
                ? alt.confidence
                : (bestConfidence + alt.confidence) / 2;
          }
        } else {
          interim += alt.transcript;
        }
      }
      opts.onInterim?.((finalText + " " + interim).trim());
    };
    recognition.onerror = () => {
      /* swallow; final transcript may still be usable */
    };
    try {
      recognition.start();
    } catch {
      recognition = null;
    }
  }

  const stop = (): Promise<CaptureResult> =>
    new Promise((resolve) => {
      const finish = (audio: Blob | null) => {
        if (stream) stream.getTracks().forEach((t) => t.stop());
        const durationSeconds = Math.max(
          1,
          Math.round((Date.now() - startedAt) / 1000),
        );
        resolve({
          transcript: finalText.trim(),
          confidence: bestConfidence,
          durationSeconds,
          audio,
          source: recognition ? "web-speech-api" : "none",
        });
      };

      // Stop recognition first so late final results land in finalText.
      if (recognition) {
        try {
          recognition.stop();
        } catch {
          /* ignore */
        }
      }

      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.onstop = () => {
          const audio = chunks.length
            ? new Blob(chunks, { type: mediaRecorder!.mimeType || "audio/webm" })
            : null;
          // Small delay lets the last speech `onresult` fire.
          setTimeout(() => finish(audio), 250);
        };
        mediaRecorder.stop();
      } else {
        setTimeout(() => finish(null), 250);
      }
    });

  return { stop };
}
