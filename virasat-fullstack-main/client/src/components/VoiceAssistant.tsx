import { AlertCircle, CheckCircle2, Languages, LoaderCircle, Mic, MicOff, Play, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { API_BASE_URL } from "../services/api";

type AssistantResponse = {
  transcript: string;
  detected_language: string;
  detected_language_name: string;
  reply_text: string;
  reply_audio_base64: string;
};

type VoiceState = "idle" | "recording" | "processing" | "ready" | "error";

function pickMimeType() {
  if (typeof MediaRecorder === "undefined") return "";
  return ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"]
    .find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
}

function audioBlobFromBase64(value: string) {
  const binary = window.atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new Blob([bytes], { type: "audio/mpeg" });
}

export function VoiceAssistant({ artisanName, craft }: { artisanName: string; craft: string }) {
  const [state, setState] = useState<VoiceState>("idle");
  const [message, setMessage] = useState("Tap the microphone and speak naturally.");
  const [response, setResponse] = useState<AssistantResponse | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioNeedsPlay, setAudioNeedsPlay] = useState(false);
  const [open, setOpen] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (audioUrl) URL.revokeObjectURL(audioUrl);
  }, [audioUrl]);

  const playReply = async (url: string) => {
    const audio = audioRef.current ?? new Audio();
    audioRef.current = audio;
    audio.src = url;
    audio.onended = () => setAudioNeedsPlay(false);
    try {
      await audio.play();
      setAudioNeedsPlay(false);
    } catch {
      setAudioNeedsPlay(true);
      setMessage("Your browser blocked automatic playback. Tap Play response to hear the assistant.");
    }
  };

  const submitRecording = async (blob: Blob) => {
    if (!blob.size) {
      setState("error");
      setMessage("No audio was captured. Please try speaking again.");
      return;
    }
    if (!API_BASE_URL) {
      setState("error");
      setMessage("The voice service is not configured for this deployment yet.");
      return;
    }
    setState("processing");
    setMessage("Listening to your craft story and preparing a response…");
    const form = new FormData();
    const extension = blob.type.includes("ogg") ? "ogg" : blob.type.includes("mp4") ? "mp4" : "webm";
    form.append("audio", blob, `virasat-artisan-query.${extension}`);
    form.append("artisan_context", JSON.stringify({ name: artisanName, craft }));
    try {
      const result = await fetch(`${API_BASE_URL}/voice-assistant/query`, { method: "POST", body: form });
      let body: AssistantResponse | { detail?: string };
      try {
        body = await result.json();
      } catch {
        throw new Error("The voice service returned an unreadable response.");
      }
      if (!result.ok) throw new Error((body as { detail?: string }).detail || "The voice assistant could not process that recording.");
      const assistantResponse = body as AssistantResponse;
      if (!assistantResponse.transcript || !assistantResponse.reply_text) throw new Error("The voice service returned an incomplete response.");
      setResponse(assistantResponse);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (assistantResponse.reply_audio_base64) {
        const nextUrl = URL.createObjectURL(audioBlobFromBase64(assistantResponse.reply_audio_base64));
        setAudioUrl(nextUrl);
        await playReply(nextUrl);
      } else {
        setMessage("The assistant replied in text, but voice playback was unavailable.");
      }
      setState("ready");
      if (!assistantResponse.reply_audio_base64) setMessage("Your answer is ready below.");
    } catch (error) {
      const detail = error instanceof Error ? error.message : "The voice assistant is temporarily unavailable.";
      setState("error");
      setMessage(detail);
      toast.error(detail);
    }
  };

  const startRecording = async () => {
    if (state === "processing") return;
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setState("error");
      setMessage("This browser does not support voice recording. Please use a current Chrome, Edge, Safari, or Firefox browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      streamRef.current = stream;
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        void submitRecording(new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" }));
      };
      recorder.start();
      setResponse(null);
      setAudioNeedsPlay(false);
      setState("recording");
      setMessage("Recording… tap the microphone again when you have finished.");
    } catch (error) {
      setState("error");
      setMessage(error instanceof DOMException && error.name === "NotAllowedError" ? "Microphone access was denied. Allow microphone access in your browser settings and try again." : "The microphone could not be opened. Please check your device and try again.");
    }
  };

  const stopRecording = () => {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  };

  const recording = state === "recording";
  if (!open) return <button type="button" className="voice-assistant-fab" onClick={() => setOpen(true)} aria-label="Open Virāsat voice assistant" title="Talk to Virāsat Assistant"><Mic size={21} /><span>Talk to Virāsat Assistant</span></button>;
  return <section className={`voice-assistant-card voice-assistant-${state}`} aria-labelledby="voice-assistant-title">
    <div className="voice-assistant-heading">
      <div><span className="eyebrow"><span className="eyebrow-stitch" /> Studio voice companion</span><h3 id="voice-assistant-title">Speak your <em>next step.</em></h3><p>Ask for help with your craft profile, experiences, visitors, or products in the language you use every day.</p></div>
      <span className="voice-assistant-mark"><Volume2 size={18} /></span>
    </div>
    <div className="voice-assistant-control-row">
      <button type="button" className={`voice-mic-button ${recording ? "voice-mic-recording" : ""}`} onClick={recording ? stopRecording : startRecording} disabled={state === "processing"} aria-label={recording ? "Stop recording" : "Start voice recording"}>
        {recording ? <MicOff size={34} /> : state === "processing" ? <LoaderCircle size={34} className="voice-spin" /> : <Mic size={34} />}
        <span>{recording ? "Stop" : state === "processing" ? "Working" : "Speak"}</span>
      </button>
      <div className="voice-assistant-status" aria-live="polite">
        <span className="voice-status-icon">{state === "error" ? <AlertCircle size={16} /> : state === "ready" ? <CheckCircle2 size={16} /> : <Languages size={16} />}</span>
        <strong>{recording ? "Your voice is being recorded" : state === "processing" ? "The assistant is listening" : state === "ready" ? `Heard in ${response?.detected_language_name ?? "your language"}` : "Voice assistant"}</strong>
        <small>{message}</small>
      </div>
    </div>
    {response && <div className="voice-assistant-transcript">
      <div><span className="eyebrow">You said</span><p>“{response.transcript}”</p></div>
      <div><span className="eyebrow">Virāsat replies</span><p>{response.reply_text}</p>{audioNeedsPlay && audioUrl && <button type="button" className="voice-play-button" onClick={() => void playReply(audioUrl)}><Play size={14} />Play response</button>}</div>
    </div>}
    <button type="button" className="voice-assistant-close" onClick={() => setOpen(false)} aria-label="Close voice assistant">×</button>
  </section>;
}
