import { AlertCircle, CheckCircle2, Languages, LoaderCircle, Mic, MicOff, Play, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { API_BASE_URL } from "../services/api";

type AssistantResponse = {
  transcript: string;
  language: string;
  reply_text: string;
  audio_base64: string;
};

type VoiceState = "idle" | "recording" | "processing" | "ready" | "error";
type BrowserSpeechRecognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

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
  const sessionIdRef = useRef<string | null>(null);
  const speechRecognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const speechTranscriptRef = useRef("");

  const languageName = (code?: string) => ({ en: "English", hi: "Hindi", kn: "Kannada", ta: "Tamil", te: "Telugu", bn: "Bengali", mr: "Marathi" }[code ?? ""] ?? code ?? "your language");

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    speechRecognitionRef.current?.stop();
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

  const speakLocalReply = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
    }
  };

  const useOfflineReply = () => {
    const transcript = speechTranscriptRef.current.trim() || "Audio query captured from the artisan.";
    const reply = `I heard your question about ${craft || "your craft practice"}. The live voice service is temporarily unavailable, but your recording was captured. Please try again shortly or continue using the Artisan workspace controls.`;
    setResponse({ transcript, language: "en", reply_text: reply, audio_base64: "" });
    setState("ready");
    setMessage("Offline voice mode is active. Your answer is ready below.");
    speakLocalReply(reply);
  };

  const submitRecording = async (blob: Blob) => {
    if (!blob.size) {
      setState("error");
      setMessage("No audio was captured. Please try speaking again.");
      return;
    }
    if (!API_BASE_URL) {
      useOfflineReply();
      return;
    }
    setState("processing");
    setMessage("Listening to your craft story and preparing a response…");
    const form = new FormData();
    const extension = blob.type.includes("ogg") ? "ogg" : blob.type.includes("mp4") ? "mp4" : "webm";
    form.append("audio", blob, `virasat-artisan-query.${extension}`);
    if (sessionIdRef.current) form.append("session_id", sessionIdRef.current);
    try {
      const result = await fetch(`${API_BASE_URL}/voice/chat`, { method: "POST", body: form });
      let body: AssistantResponse & { session_id?: string; detail?: string };
      try {
        body = await result.json();
      } catch {
        throw new Error("The voice service returned an unreadable response.");
      }
      if (!result.ok) throw new Error(body.detail || "The voice assistant could not process that recording.");
      if (!body.transcript || !body.reply_text) throw new Error("The voice service returned an incomplete response.");
      sessionIdRef.current = body.session_id ?? sessionIdRef.current;
      setResponse(body);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (body.audio_base64) {
        const nextUrl = URL.createObjectURL(audioBlobFromBase64(body.audio_base64));
        setAudioUrl(nextUrl);
        await playReply(nextUrl);
      } else {
        setMessage("The assistant replied in text, but voice playback was unavailable.");
      }
      setState("ready");
      if (!body.audio_base64) setMessage("Your answer is ready below. Voice playback was unavailable.");
    } catch {
      useOfflineReply();
      toast.info("Live voice service unavailable. Continued in offline voice mode.");
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
      speechTranscriptRef.current = "";
      streamRef.current = stream;
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        speechRecognitionRef.current?.stop();
        window.setTimeout(() => void submitRecording(new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" })), 250);
      };
      recorder.start();
      const recognitionConstructor = (window as Window & { SpeechRecognition?: new () => BrowserSpeechRecognition; webkitSpeechRecognition?: new () => BrowserSpeechRecognition }).SpeechRecognition
        ?? (window as Window & { webkitSpeechRecognition?: new () => BrowserSpeechRecognition }).webkitSpeechRecognition;
      if (recognitionConstructor) {
        const recognition = new recognitionConstructor();
        recognition.lang = "en-IN";
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.onresult = (event) => {
          speechTranscriptRef.current = Array.from(event.results).map((result) => result[0]?.transcript ?? "").join(" ");
        };
        recognition.onerror = () => undefined;
        recognition.onend = () => undefined;
        speechRecognitionRef.current = recognition;
        recognition.start();
      }
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
        <strong>{recording ? "Your voice is being recorded" : state === "processing" ? "The assistant is listening" : state === "ready" ? `Heard in ${languageName(response?.language)}` : "Voice assistant"}</strong>
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
