import { LanguageCode } from "./geminiService";

export function startVoiceInput(
  langCode: LanguageCode,
  onResult: (text: string, isFinal: boolean) => void,
  onEnd: () => void
) {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.error("Voice input not supported. Please use Google Chrome.");
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = langCode;
  recognition.continuous = false;
  recognition.interimResults = true;

  recognition.onresult = (event: any) => {
    let interim = "", final = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        final += event.results[i][0].transcript;
      } else {
        interim += event.results[i][0].transcript;
      }
    }
    onResult(final || interim, !!final);
  };

  recognition.onend = () => {
    onEnd();
  };

  recognition.onerror = (e: any) => {
    console.error("Speech error:", e.error);
    onEnd();
  };

  recognition.start();
  return recognition;
}

export function speakText(text: string, langCode: LanguageCode) {
  const synth = window.speechSynthesis;
  synth.cancel();

  const clean = text
    .replace(/\[CORRECT\]/g, "")
    .replace(/\[WRONG\]/g, "")
    .replace(/[*#_`]/g, "")
    .replace(/\n+/g, " ")
    .trim();

  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = langCode;
  utterance.rate = 0.9;
  utterance.pitch = 1.0;

  const voices = synth.getVoices();
  const langPrefix = langCode.split("-")[0];
  const matchedVoice = voices.find(v =>
    v.lang.toLowerCase().startsWith(langPrefix)
  );
  if (matchedVoice) utterance.voice = matchedVoice;

  synth.speak(utterance);
  return utterance;
}
