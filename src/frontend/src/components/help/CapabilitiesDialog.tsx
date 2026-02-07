import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle2, XCircle } from 'lucide-react';

type CapabilitiesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function CapabilitiesDialog({ open, onOpenChange }: CapabilitiesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Capabilities & Limits</DialogTitle>
          <DialogDescription>
            Understanding what SuperNova can and cannot do
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Capabilities */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              What SuperNova Can Do
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><strong>Web search:</strong> Search and retrieve information from Wikipedia and DuckDuckGo with a dedicated web search mode</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><strong>Source citations:</strong> Provide clickable links to all information sources with excerpts for verification</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><strong>Cooking assistance:</strong> Help with recipes, ingredients, and cooking instructions in an easy-to-follow format</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><strong>Voice interaction:</strong> Accept voice input and read responses aloud</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><strong>Conversation history:</strong> Save and revisit past conversations for authenticated users</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><strong>Multi-source synthesis:</strong> Combine information from multiple sources into coherent summaries</span>
              </li>
            </ul>
          </div>

          {/* Limitations */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <XCircle className="h-5 w-5 text-muted-foreground" />
              What SuperNova Cannot Do
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground mt-0.5">•</span>
                <span><strong>Interactive browsing:</strong> Cannot navigate websites, fill forms, or interact with web pages like a full browser</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground mt-0.5">•</span>
                <span><strong>Real-time updates:</strong> Information is limited to what public search APIs return at the time of query</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground mt-0.5">•</span>
                <span><strong>Device control:</strong> Cannot control smart home devices, IoT systems, or access local files</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground mt-0.5">•</span>
                <span><strong>Communication:</strong> Cannot make phone calls, send messages, or access email</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground mt-0.5">•</span>
                <span><strong>Media generation:</strong> Cannot generate images, videos, or other media content</span>
              </li>
            </ul>
          </div>

          {/* Usage tips */}
          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-semibold mb-2">Tips for Best Results</h3>
            <p className="text-sm text-muted-foreground mb-2">
              <strong>Web search mode:</strong> Use the "Web search" toggle for explicit web queries. Results include a synthesized answer and clickable source links.
            </p>
            <p className="text-sm text-muted-foreground mb-2">
              <strong>Cooking queries:</strong> Ask for recipes, ingredients, or cooking instructions. SuperNova will format responses with clear sections for easy following.
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>General tips:</strong> Ask clear, specific questions. SuperNova works best with factual queries. If a search fails, try rephrasing your question or checking your internet connection.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
