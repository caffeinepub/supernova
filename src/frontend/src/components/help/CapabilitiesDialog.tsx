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
                <span>Search and retrieve information from Wikipedia and DuckDuckGo</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Accept voice input and read responses aloud</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Save conversation history for authenticated users</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Provide source citations for all information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Combine information from multiple sources into coherent summaries</span>
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
                <span>Control smart home devices or IoT systems</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground mt-0.5">•</span>
                <span>Access or manage files on your device</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground mt-0.5">•</span>
                <span>Make phone calls or send messages</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground mt-0.5">•</span>
                <span>Access real-time data or current events beyond search results</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground mt-0.5">•</span>
                <span>Generate images, videos, or other media</span>
              </li>
            </ul>
          </div>

          {/* Usage tips */}
          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-semibold mb-2">Tips for Best Results</h3>
            <p className="text-sm text-muted-foreground">
              Ask clear, specific questions. SuperNova works best with factual queries that can be answered using publicly available information. For authenticated users, all conversations are automatically saved and can be revisited later.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
