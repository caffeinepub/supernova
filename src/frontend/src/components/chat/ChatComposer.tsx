import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Mic, MicOff, Loader2, MessageSquare, Globe, Paperclip, X } from 'lucide-react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { MessageMode } from './types';

type ChatComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSendMessage: (content: string, mode: MessageMode, photos?: File[]) => void;
  isLoading: boolean;
  disabled?: boolean;
};

export default function ChatComposer({ value, onChange, onSendMessage, isLoading, disabled }: ChatComposerProps) {
  const [localInput, setLocalInput] = useState(value);
  const [mode, setMode] = useState<MessageMode>('chat');
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  // Clean up preview URLs when photos change
  useEffect(() => {
    return () => {
      photoPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [photoPreviewUrls]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!localInput.trim() && selectedPhotos.length === 0) || isLoading || disabled) return;

    onSendMessage(localInput.trim(), mode, selectedPhotos.length > 0 ? selectedPhotos : undefined);
    setLocalInput('');
    onChange('');
    
    // Clear photos after sending
    photoPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    setSelectedPhotos([]);
    setPhotoPreviewUrls([]);
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

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Filter for image files only
    const imageFiles = files.filter(file => 
      file.type === 'image/png' || 
      file.type === 'image/jpeg' || 
      file.type === 'image/jpg' ||
      file.type === 'image/webp'
    );

    if (imageFiles.length > 0) {
      setSelectedPhotos(prev => [...prev, ...imageFiles]);
      
      // Create preview URLs
      const newPreviewUrls = imageFiles.map(file => URL.createObjectURL(file));
      setPhotoPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    // Revoke the URL to free memory
    URL.revokeObjectURL(photoPreviewUrls[index]);
    
    setSelectedPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="p-4 space-y-2">
      {error && (
        <Alert variant="destructive" className="mb-2">
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Mode selector */}
      <div className="flex items-center gap-1 mb-2">
        <Button
          type="button"
          variant={mode === 'chat' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setMode('chat')}
          disabled={isLoading || disabled}
          className="h-8 px-3 text-xs"
        >
          <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
          Chat
        </Button>
        <Button
          type="button"
          variant={mode === 'web-search' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setMode('web-search')}
          disabled={isLoading || disabled}
          className="h-8 px-3 text-xs"
        >
          <Globe className="h-3.5 w-3.5 mr-1.5" />
          Web search
        </Button>
      </div>

      {/* Photo previews */}
      {photoPreviewUrls.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {photoPreviewUrls.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="h-20 w-20 object-cover rounded-lg border border-border"
              />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={isLoading || disabled}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-end gap-2 rounded-3xl border border-border bg-background shadow-sm focus-within:border-ring focus-within:ring-1 focus-within:ring-ring transition-all">
          <Textarea
            value={localInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={
              disabled 
                ? "Please log in to continue..." 
                : mode === 'web-search'
                ? "Search the web..."
                : "Message SuperNova..."
            }
            disabled={isLoading || disabled}
            className="flex-1 min-h-[52px] max-h-[200px] resize-none border-0 bg-transparent px-4 py-3 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
            rows={1}
          />
          
          <div className="flex items-center gap-1 pr-2 pb-2">
            {/* Photo upload button */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              multiple
              onChange={handlePhotoSelect}
              className="hidden"
              disabled={isLoading || disabled}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || disabled}
              className="h-8 w-8 rounded-full"
              title="Attach photos"
            >
              <Paperclip className="h-4 w-4" />
            </Button>

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
              disabled={(!localInput.trim() && selectedPhotos.length === 0) || isLoading || disabled}
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
