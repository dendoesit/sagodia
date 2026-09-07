"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getAudioContext, isSpeaking } from "@/lib/audio";

export type ListenStatus = "idle" | "starting" | "listening" | "blocked";

type Options = {
  /** Called every animation frame with a 0–1 loudness, for the listening visual. */
  onFrame?: (level: number) => void;
  /** Called once per armed period when the child clearly says something. */
  onSpeech?: () => void;
};

/** Frames above the threshold before we believe it — filters out door slams. */
const FRAMES_TO_CONFIRM = 7;
const MIN_THRESHOLD = 0.035;
const CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

let sharedStream: MediaStream | null = null;
let sharedRequest: Promise<MediaStream | null> | null = null;

function streamIsLive(stream: MediaStream | null): stream is MediaStream {
  return Boolean(
    stream?.getAudioTracks().some((track) => track.readyState === "live"),
  );
}

/**
 * Begin the permission request inside the animal's pointer event. SayAlong
 * later awaits this same promise, so mounting the overlay never asks twice.
 */
export function primeVoiceInput(): Promise<MediaStream | null> {
  if (
    typeof navigator === "undefined" ||
    !navigator.mediaDevices?.getUserMedia
  ) {
    return Promise.resolve(null);
  }
  if (streamIsLive(sharedStream)) return Promise.resolve(sharedStream);
  if (sharedRequest) return sharedRequest;

  sharedRequest = navigator.mediaDevices
    .getUserMedia({ audio: CONSTRAINTS })
    .then((stream) => {
      sharedStream = stream;
      return stream;
    })
    .catch(() => null);
  return sharedRequest;
}

function releaseVoiceInput(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
  if (stream === sharedStream) sharedStream = null;
  sharedRequest = null;
}

/**
 * Listens to the microphone purely to know *that* the child spoke and how
 * loudly, which is what drives the "I am listening to you" ring. The audio
 * never leaves the device and is never recorded — only a running loudness
 * number is read off an AnalyserNode.
 */
export function useVoiceListener({ onFrame, onSpeech }: Options) {
  const [status, setStatus] = useState<ListenStatus>("idle");
  const streamRef = useRef<MediaStream | null>(null);
  const nodesRef = useRef<{
    source: MediaStreamAudioSourceNode;
    analyser: AnalyserNode;
  } | null>(null);
  const frameRef = useRef(0);
  const armedRef = useRef(false);
  const floorRef = useRef(0.02);
  const loudRef = useRef(0);
  const callbacks = useRef({ onFrame, onSpeech });

  useEffect(() => {
    callbacks.current = { onFrame, onSpeech };
  });

  const stop = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    frameRef.current = 0;
    armedRef.current = false;
    nodesRef.current?.source.disconnect();
    nodesRef.current = null;
    releaseVoiceInput(streamRef.current);
    streamRef.current = null;
    setStatus("idle");
  }, []);

  useEffect(() => stop, [stop]);

  const start = useCallback(async () => {
    if (streamRef.current) return true;
    setStatus("starting");
    try {
      const stream = await primeVoiceInput();
      if (!stream) {
        setStatus("blocked");
        return false;
      }
      const ctx = getAudioContext();
      if (!ctx) {
        releaseVoiceInput(stream);
        setStatus("blocked");
        return false;
      }
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.4;
      // Deliberately not connected to the destination: that would echo the
      // child's voice back through the speaker.
      source.connect(analyser);

      streamRef.current = stream;
      nodesRef.current = { source, analyser };

      const samples = new Uint8Array(analyser.fftSize);
      const tick = () => {
        analyser.getByteTimeDomainData(samples);
        let sum = 0;
        for (let i = 0; i < samples.length; i += 1) {
          const value = (samples[i] - 128) / 128;
          sum += value * value;
        }
        const rms = Math.sqrt(sum / samples.length);
        callbacks.current.onFrame?.(Math.min(1, rms * 7));

        // While the app is talking, only update the noise floor — otherwise
        // the game would hear itself and award a star for its own voice.
        if (!armedRef.current || isSpeaking()) {
          floorRef.current = floorRef.current * 0.95 + rms * 0.05;
          loudRef.current = 0;
        } else if (rms > Math.max(MIN_THRESHOLD, floorRef.current * 3)) {
          loudRef.current += 1;
          if (loudRef.current >= FRAMES_TO_CONFIRM) {
            loudRef.current = 0;
            armedRef.current = false;
            callbacks.current.onSpeech?.();
          }
        } else {
          loudRef.current = Math.max(0, loudRef.current - 1);
          floorRef.current = floorRef.current * 0.98 + rms * 0.02;
        }

        frameRef.current = requestAnimationFrame(tick);
      };
      frameRef.current = requestAnimationFrame(tick);
      setStatus("listening");
      return true;
    } catch {
      setStatus("blocked");
      return false;
    }
  }, []);

  /** Begin accepting speech for the current word. */
  const arm = useCallback(() => {
    loudRef.current = 0;
    armedRef.current = true;
  }, []);

  const disarm = useCallback(() => {
    armedRef.current = false;
    loudRef.current = 0;
  }, []);

  return { status, start, stop, arm, disarm };
}
