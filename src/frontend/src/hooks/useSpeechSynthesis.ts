import { useState, useEffect, useRef } from 'react';

type SpeechSynthesisHook = {
  speak: (text: string) => void;
  stop: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
  error: string | null;
};

export function useSpeechSynthesis(): SpeechSynthesisHook {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
    } else {
      setIsSupported(false);
      setError('Text-to-speech is not supported in your browser.');
    }

    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch (err) {
          console.error('Error canceling speech on cleanup:', err);
        }
      }
    };
  }, []);

  const speak = (text: string) => {
    if (!isSupported) {
      setError('Text-to-speech is not supported in your browser.');
      return;
    }

    if (!text || !text.trim()) {
      return;
    }

    try {
      // Cancel any ongoing speech
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setError(null);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        utteranceRef.current = null;
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setError('Text-to-speech error occurred.');
        setIsSpeaking(false);
        utteranceRef.current = null;
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Error speaking:', err);
      setError('Failed to speak text. Please try again.');
      setIsSpeaking(false);
      utteranceRef.current = null;
    }
  };

  const stop = () => {
    try {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      utteranceRef.current = null;
    } catch (err) {
      console.error('Error stopping speech:', err);
      setIsSpeaking(false);
      utteranceRef.current = null;
    }
  };

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
    error
  };
}
