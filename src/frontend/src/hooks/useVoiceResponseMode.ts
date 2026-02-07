import { useState, useEffect } from 'react';

export type VoiceResponseMode = 'off' | 'voice-text' | 'voice-only';

const STORAGE_KEY = 'voice-response-mode';

export function useVoiceResponseMode() {
  const [mode, setMode] = useState<VoiceResponseMode>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'voice-text' || stored === 'voice-only' || stored === 'off') {
        return stored;
      }
    } catch (error) {
      console.error('Failed to load voice mode from localStorage:', error);
    }
    return 'off';
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch (error) {
      console.error('Failed to save voice mode to localStorage:', error);
    }
  }, [mode]);

  return { mode, setMode };
}
