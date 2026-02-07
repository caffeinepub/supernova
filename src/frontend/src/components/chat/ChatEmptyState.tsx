import { Button } from '@/components/ui/button';
import { Sparkles, MessageSquare, Globe, History, Mic, Cookie } from 'lucide-react';

type ChatEmptyStateProps = {
  onPromptClick: (prompt: string) => void;
};

const examplePrompts = [
  "How do I make chocolate chip cookies?",
  "Search the web for the latest AI developments",
  "What's a good recipe for homemade pizza?",
  "Find information about quantum computing"
];

export default function ChatEmptyState({ onPromptClick }: ChatEmptyStateProps) {
  return (
    <div className="flex items-center justify-center min-h-full p-6">
      <div className="max-w-2xl w-full space-y-8 text-center">
        {/* Icon and title */}
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold">
            How can I help you today?
          </h2>
        </div>

        {/* Example prompts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
          {examplePrompts.map((prompt, idx) => (
            <Button
              key={idx}
              variant="outline"
              className="h-auto p-4 text-left justify-start hover:bg-accent/50 transition-colors"
              onClick={() => onPromptClick(prompt)}
            >
              <div className="flex items-start gap-3 w-full">
                {prompt.toLowerCase().includes('cookie') || prompt.toLowerCase().includes('recipe') || prompt.toLowerCase().includes('pizza') ? (
                  <Cookie className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                ) : prompt.toLowerCase().includes('search') || prompt.toLowerCase().includes('find') ? (
                  <Globe className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                ) : (
                  <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                )}
                <span className="text-sm leading-relaxed">{prompt}</span>
              </div>
            </Button>
          ))}
        </div>

        {/* Capabilities hint */}
        <div className="pt-8 space-y-3">
          <p className="text-sm text-muted-foreground">
            SuperNova can help you with:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" />
              <span>Web search</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Cookie className="h-3.5 w-3.5" />
              <span>Cooking help</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mic className="h-3.5 w-3.5" />
              <span>Voice input</span>
            </div>
            <div className="flex items-center gap-1.5">
              <History className="h-3.5 w-3.5" />
              <span>Conversation history</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
