import { useState, useEffect } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useExportUserData } from './hooks/useQueries';
import LoginButton from './components/auth/LoginButton';
import ProfileSetupDialog from './components/auth/ProfileSetupDialog';
import ConversationThread from './components/chat/ConversationThread';
import ChatComposer from './components/chat/ChatComposer';
import ChatEmptyState from './components/chat/ChatEmptyState';
import ConversationSidebar from './components/history/ConversationSidebar';
import CapabilitiesDialog from './components/help/CapabilitiesDialog';
import { useConversationHistory } from './hooks/useConversationHistory';
import { useInformationRetrieval } from './hooks/useInformationRetrieval';
import { downloadJson } from './utils/downloadJson';
import { Menu, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ title: string; url: string; excerpt: string }>;
  timestamp: Date;
};

function App() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { 
    activeConversationId, 
    activeEntries, 
    conversationSummaries, 
    switchConversation, 
    startNewConversation, 
    saveEntry 
  } = useConversationHistory();
  const { fetchInformation, isLoading: retrievalLoading, partialFailureWarning } = useInformationRetrieval();
  const { mutateAsync: exportData, isPending: isExporting } = useExportUserData();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [capabilitiesOpen, setCapabilitiesOpen] = useState(false);
  const [composerValue, setComposerValue] = useState('');

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  // Load conversation entries when active conversation changes
  useEffect(() => {
    if (activeEntries.length > 0) {
      const loadedMessages: Message[] = activeEntries.flatMap((entry, idx) => [
        {
          id: `user-${idx}-${entry.timestamp.toString()}`,
          role: 'user' as const,
          content: entry.question,
          timestamp: new Date(Number(entry.timestamp) / 1000000)
        },
        {
          id: `assistant-${idx}-${entry.timestamp.toString()}`,
          role: 'assistant' as const,
          content: entry.response.summarizedAnswer,
          sources: entry.response.sources,
          timestamp: new Date(Number(entry.timestamp) / 1000000)
        }
      ]);
      setMessages(loadedMessages);
    } else {
      setMessages([]);
    }
  }, [activeEntries]);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const result = await fetchInformation(content);
      
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: result.summarizedAnswer,
        sources: result.sources,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Save to backend if authenticated
      if (isAuthenticated) {
        await saveEntry(content, result);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: `assistant-error-${Date.now()}`,
        role: 'assistant',
        content: 'I apologize, but I encountered an error while retrieving information. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleNewConversation = async () => {
    try {
      await startNewConversation();
      setMessages([]);
      setSidebarOpen(false);
    } catch (error) {
      toast.error('Failed to create new conversation');
      console.error('Failed to create conversation:', error);
    }
  };

  const handleSwitchConversation = (conversationId: bigint) => {
    switchConversation(conversationId);
    setSidebarOpen(false);
  };

  const handleExamplePrompt = (prompt: string) => {
    setComposerValue(prompt);
  };

  const handleExportData = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to export your data');
      return;
    }

    try {
      const data = await exportData();
      downloadJson(data);
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
      console.error('Export error:', error);
    }
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="flex h-screen bg-background text-foreground">
        {/* Desktop Sidebar - persistent on md+ */}
        {isAuthenticated && (
          <aside className="hidden md:flex w-64 border-r border-border bg-sidebar flex-col">
            <ConversationSidebar
              conversations={conversationSummaries}
              currentConversationId={activeConversationId}
              onSelectConversation={handleSwitchConversation}
              onNewConversation={handleNewConversation}
              onExportData={handleExportData}
              isAuthenticated={isAuthenticated}
            />
          </aside>
        )}

        {/* Mobile Sidebar - drawer */}
        {isAuthenticated && (
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetContent side="left" className="w-80 p-0">
              <ConversationSidebar
                conversations={conversationSummaries}
                currentConversationId={activeConversationId}
                onSelectConversation={handleSwitchConversation}
                onNewConversation={handleNewConversation}
                onExportData={handleExportData}
                isAuthenticated={isAuthenticated}
              />
            </SheetContent>
          </Sheet>
        )}

        {/* Main content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Minimal Header */}
          <header className="border-b border-border bg-background/80 backdrop-blur-sm">
            <div className="flex items-center justify-between px-3 py-2 md:px-4 md:py-3">
              <div className="flex items-center gap-2">
                {isAuthenticated && (
                  <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                  </Sheet>
                )}
                <h1 className="text-lg md:text-xl font-semibold">
                  SuperNova
                </h1>
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCapabilitiesOpen(true)}
                  title="Capabilities & Limits"
                >
                  <HelpCircle className="h-5 w-5" />
                </Button>
                <LoginButton />
              </div>
            </div>
          </header>

          {/* Partial failure warning */}
          {partialFailureWarning && (
            <Alert className="m-4 mb-0 border-amber-500/50 bg-amber-500/10">
              <AlertDescription className="text-sm">
                {partialFailureWarning}
              </AlertDescription>
            </Alert>
          )}

          {/* Conversation area with bottom-pinned composer */}
          <main className="flex-1 overflow-hidden flex flex-col">
            {messages.length === 0 ? (
              <div className="flex-1 overflow-y-auto">
                <ChatEmptyState onPromptClick={handleExamplePrompt} />
              </div>
            ) : (
              <ConversationThread messages={messages} />
            )}

            {/* Chat composer - pinned to bottom */}
            <div className="border-t border-border bg-background">
              <div className="max-w-3xl mx-auto">
                <ChatComposer
                  value={composerValue}
                  onChange={setComposerValue}
                  onSendMessage={handleSendMessage}
                  isLoading={retrievalLoading}
                  disabled={!isAuthenticated && messages.length >= 3}
                />
                {!isAuthenticated && messages.length >= 3 && (
                  <div className="px-4 pb-3 text-center">
                    <p className="text-sm text-muted-foreground">
                      Please log in to continue the conversation and save your history.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>

        {/* Dialogs */}
        <ProfileSetupDialog open={showProfileSetup} />
        <CapabilitiesDialog open={capabilitiesOpen} onOpenChange={setCapabilitiesOpen} />
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;
