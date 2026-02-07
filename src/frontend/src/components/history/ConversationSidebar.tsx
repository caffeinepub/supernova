import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Plus, MessageSquare, Download } from 'lucide-react';
import type { ConversationSummary } from '../../backend';

type ConversationSidebarProps = {
  conversations: ConversationSummary[];
  currentConversationId?: bigint | null;
  onSelectConversation: (id: bigint) => void;
  onNewConversation: () => void;
  onExportData?: () => void;
  isAuthenticated: boolean;
};

export default function ConversationSidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onExportData,
  isAuthenticated
}: ConversationSidebarProps) {
  return (
    <div className="flex flex-col h-full bg-sidebar">
      <div className="p-3">
        <Button onClick={onNewConversation} variant="outline" className="w-full justify-start gap-2 h-11">
          <Plus className="h-4 w-4" />
          New chat
        </Button>
      </div>
      
      <Separator />
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {conversations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8 px-4">
              No conversations yet
            </p>
          ) : (
            conversations.map((conversation) => (
              <button
                key={conversation.id.toString()}
                onClick={() => onSelectConversation(conversation.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors group ${
                  currentConversationId?.toString() === conversation.id.toString()
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'
                }`}
              >
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {conversation.title || 'Untitled conversation'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(Number(conversation.lastUpdated) / 1000000).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>

      {isAuthenticated && onExportData && (
        <>
          <Separator />
          <div className="p-3">
            <Button 
              onClick={onExportData} 
              variant="ghost" 
              className="w-full justify-start gap-2 h-11"
            >
              <Download className="h-4 w-4" />
              Export data
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
