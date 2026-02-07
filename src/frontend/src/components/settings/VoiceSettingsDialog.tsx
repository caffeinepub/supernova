import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { VoiceResponseMode } from '../../hooks/useVoiceResponseMode';

type VoiceSettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: VoiceResponseMode;
  onModeChange: (mode: VoiceResponseMode) => void;
  isSupported: boolean;
};

export default function VoiceSettingsDialog({ 
  open, 
  onOpenChange, 
  mode, 
  onModeChange,
  isSupported 
}: VoiceSettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Voice Response Settings</DialogTitle>
          <DialogDescription>
            Choose how the assistant responds to your messages.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {!isSupported && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/50 text-sm text-amber-600 dark:text-amber-400">
              Text-to-speech is not supported in your browser. Voice features will not work.
            </div>
          )}
          
          <RadioGroup value={mode} onValueChange={(value) => onModeChange(value as VoiceResponseMode)}>
            <div className="flex items-start space-x-3 space-y-0">
              <RadioGroupItem value="off" id="mode-off" />
              <div className="flex-1">
                <Label htmlFor="mode-off" className="font-medium cursor-pointer">
                  Off
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Text responses only. No voice output.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 space-y-0">
              <RadioGroupItem value="voice-text" id="mode-voice-text" disabled={!isSupported} />
              <div className="flex-1">
                <Label htmlFor="mode-voice-text" className="font-medium cursor-pointer">
                  Voice + Text
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Assistant speaks responses aloud and displays text.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 space-y-0">
              <RadioGroupItem value="voice-only" id="mode-voice-only" disabled={!isSupported} />
              <div className="flex-1">
                <Label htmlFor="mode-voice-only" className="font-medium cursor-pointer">
                  Voice Only
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Assistant speaks responses aloud. Text is hidden but sources remain visible.
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>
      </DialogContent>
    </Dialog>
  );
}
