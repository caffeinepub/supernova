import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Volume2, VolumeX, ExternalLink, User, Bot, Globe } from 'lucide-react';
import type { Message } from './types';
import type { VoiceResponseMode } from '../../hooks/useVoiceResponseMode';

type ConversationThreadProps = {
  messages: Message[];
  voiceMode?: VoiceResponseMode;
  isSpeaking?: boolean;
  onSpeak?: (text: string) => void;
  onStop?: () => void;
};

export default function ConversationThread({ 
  messages, 
  voiceMode = 'off',
  isSpeaking = false,
  onSpeak,
  onStop
}: ConversationThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSpeak = (text: string) => {
    if (isSpeaking && onStop) {
      onStop();
    } else if (onSpeak) {
      onSpeak(text);
    }
  };

  const renderContent = (content: string) => {
    // Check if content has structured cooking format
    if (content.includes('**Ingredients:**') || content.includes('**Steps:**')) {
      const sections = content.split(/\*\*(.*?):\*\*/g);
      const parts: ReactNode[] = [];
      
      for (let i = 0; i < sections.length; i++) {
        if (i % 2 === 0) {
          // Regular text
          if (sections[i].trim()) {
            parts.push(
              <p key={i} className="whitespace-pre-wrap break-words leading-relaxed">
                {sections[i].trim()}
              </p>
            );
          }
        } else {
          // Section header
          const sectionTitle = sections[i];
          const sectionContent = sections[i + 1];
          
          parts.push(
            <div key={i} className="mt-4 first:mt-0">
              <h4 className="font-semibold text-base mb-2">{sectionTitle}:</h4>
              {sectionTitle === 'Steps' ? (
                <ol className="space-y-2 pl-5 list-decimal">
                  {sectionContent.split('\n').filter(line => line.trim()).map((step, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {step.replace(/^\d+\.\s*/, '')}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="whitespace-pre-wrap break-words leading-relaxed">
                  {sectionContent}
                </p>
              )}
            </div>
          );
          i++; // Skip the content part as we've already processed it
        }
      }
      
      return <div className="space-y-3">{parts}</div>;
    }
    
    // Regular content
    return (
      <p className="whitespace-pre-wrap break-words leading-relaxed m-0">
        {content}
      </p>
    );
  };

  return (
    <ScrollArea className="flex-1">
      <div ref={scrollRef} className="space-y-0">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`w-full border-b border-border/50 ${
              message.role === 'assistant' ? 'bg-muted/30' : 'bg-background'
            }`}
          >
            <div className="max-w-3xl mx-auto px-4 py-6 md:px-6 md:py-8">
              <div className="flex gap-4 md:gap-6">
                {/* Role indicator */}
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-accent text-accent-foreground'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                </div>

                {/* Message content */}
                <div className="flex-1 min-w-0 space-y-4">
                  {/* Web search badge for assistant messages */}
                  {message.role === 'assistant' && message.mode === 'web-search' && (
                    <Badge variant="secondary" className="mb-2">
                      <Globe className="h-3 w-3 mr-1" />
                      Web search results
                    </Badge>
                  )}

                  {/* Photo attachments for user messages */}
                  {message.role === 'user' && message.photos && message.photos.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {message.photos.map((photo, idx) => (
                        <img
                          key={idx}
                          src={photo.url}
                          alt={photo.filename || `Attachment ${idx + 1}`}
                          className="max-w-xs max-h-64 object-contain rounded-lg border border-border"
                        />
                      ))}
                    </div>
                  )}

                  {/* Content - hidden in voice-only mode for assistant messages */}
                  {!(message.role === 'assistant' && voiceMode === 'voice-only') && (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {renderContent(message.content)}
                    </div>
                  )}

                  {/* TTS and Sources for assistant messages */}
                  {message.role === 'assistant' && (
                    <div className="space-y-3">
                      {/* TTS control - only show if handlers are provided */}
                      {onSpeak && onStop && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSpeak(message.content)}
                            className="h-8 px-3 text-xs"
                          >
                            {isSpeaking ? (
                              <>
                                <VolumeX className="h-3.5 w-3.5 mr-1.5" />
                                Stop
                              </>
                            ) : (
                              <>
                                <Volume2 className="h-3.5 w-3.5 mr-1.5" />
                                Read aloud
                              </>
                            )}
                          </Button>
                        </div>
                      )}

                      {/* Sources - always visible even in voice-only mode */}
                      {message.sources && message.sources.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Sources
                          </h4>
                          <div className="grid gap-2">
                            {message.sources.map((source, idx) => (
                              <a
                                key={idx}
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-start gap-2 p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                              >
                                <ExternalLink className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground group-hover:text-foreground" />
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm line-clamp-1 group-hover:text-primary">
                                    {source.title}
                                  </div>
                                  <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                    {source.excerpt}
                                  </div>
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
