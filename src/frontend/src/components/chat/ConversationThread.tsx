import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, ExternalLink, User, Bot } from 'lucide-react';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import type { Message } from '../../App';

type ConversationThreadProps = {
  messages: Message[];
};

export default function ConversationThread({ messages }: ConversationThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { speak, stop, isSpeaking } = useSpeechSynthesis();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSpeak = (text: string) => {
    if (isSpeaking) {
      stop();
    } else {
      speak(text);
    }
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
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap break-words leading-relaxed m-0">
                      {message.content}
                    </p>
                  </div>

                  {/* Sources and TTS for assistant messages */}
                  {message.role === 'assistant' && (
                    <div className="space-y-3">
                      {/* TTS control */}
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

                      {/* Sources */}
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
                                className="block p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors group"
                              >
                                <div className="flex items-start gap-2">
                                  <ExternalLink className="h-3.5 w-3.5 mt-0.5 text-muted-foreground group-hover:text-foreground flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground group-hover:text-primary line-clamp-1">
                                      {source.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                      {source.excerpt}
                                    </p>
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
