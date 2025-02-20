import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface TextToSpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
}

export function useTextToSpeech(defaultOptions: TextToSpeechOptions = {}) {
  const [speaking, setSpeaking] = useState(false);
  const { i18n } = useTranslation();
  const [synth, setSynth] = useState<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSynth(window.speechSynthesis);
    }
  }, []);

  const speak = useCallback((text: string, options: TextToSpeechOptions = {}) => {
    if (!synth) return;

    // Cancela qualquer fala em andamento
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Define o idioma baseado na preferência do usuário ou no idioma atual da aplicação
    utterance.lang = options.lang || i18n.language === 'pt' ? 'pt-BR' : 'en-US';
    utterance.rate = options.rate || defaultOptions.rate || 1;
    utterance.pitch = options.pitch || defaultOptions.pitch || 1;
    utterance.volume = options.volume || defaultOptions.volume || 1;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    synth.speak(utterance);
  }, [synth, i18n.language, defaultOptions]);

  const stop = useCallback(() => {
    if (!synth) return;
    synth.cancel();
    setSpeaking(false);
  }, [synth]);

  return {
    speak,
    stop,
    speaking,
    supported: !!synth
  };
}
