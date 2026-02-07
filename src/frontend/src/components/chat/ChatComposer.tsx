import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Mic, MicOff, Loader2 } from 'lucide-react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { Alert, AlertDescription } from '@/components/ui/alert';

type ChatComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  disabled?: boolean;
};

export default function ChatComposer({ value, onChange, onSendMessage, isLoading, disabled }: ChatComposerProps) {
  const [localInput, setLocalInput] = useState(value);
  const { transcript, isRecording, isSupported, error, startRecording, stopRecording, resetTranscript } = useSpeechRecognition();

  // Sync external value changes
  useEffect(() => {
    setLocalInput(value);
  }, [value]);

  useEffect(() => {
    if (transcript) {
      const newValue = localInput + (localInput ? ' ' : '') + transcript;
      setLocalInput(newValue);
      onChange(newValue);
      resetTranscript();
    }
  }, [transcript, resetTranscript, localInput, onChange]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localInput.trim() || isLoading || disabled) return;

    onSendMessage(localInput.trim());
    setLocalInput('');
    onChange('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalInput(newValue);
    onChange(newValue);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="p-4 space-y-2">
      {error && (
        <Alert variant="destructive" className="mb-2">
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-end gap-2 rounded-3xl border border-border bg-background shadow-sm focus-within:border-ring focus-within:ring-1 focus-within:ring-ring transition-all">
          <Textarea
            value={localInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? "Please log in to continue..." : "Message SuperNova..."}
            disabled={isLoading || disabled}
            className="flex-1 min-h-[52px] max-h-[200px] resize-none border-0 bg-transparent px-4 py-3 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
            rows={1}
          />
          
          <div className="flex items-center gap-1 pr-2 pb-2">
            {isSupported && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={toggleRecording}
                disabled={isLoading || disabled}
                className={`h-8 w-8 rounded-full ${isRecording ? 'text-destructive' : ''}`}
              >
                {isRecording ? (
                  <MicOff className="h-4 w-4 animate-pulse" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
            )}
            
            <Button
              type="submit"
              disabled={!localInput.trim() || isLoading || disabled}
              size="icon"
              className="h-8 w-8 rounded-full"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
