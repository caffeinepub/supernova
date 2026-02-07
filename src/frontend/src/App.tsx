import { useState, useEffect, useRef } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useExportUserData } from './hooks/useQueries';
import LoginButton from './components/auth/LoginButton';
import ProfileSetupDialog from './components/auth/ProfileSetupDialog';
import ConversationThread from './components/chat/ConversationThread';
import ChatComposer from './components/chat/ChatComposer';
import ChatEmptyState from './components/chat/ChatEmptyState';
import ConversationSidebar from './components/history/ConversationSidebar';
import CapabilitiesDialog from './components/help/CapabilitiesDialog';
import VoiceSettingsDialog from './components/settings/VoiceSettingsDialog';
import { useConversationHistory } from './hooks/useConversationHistory';
import { useInformationRetrieval } from './hooks/useInformationRetrieval';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { useVoiceResponseMode } from './hooks/useVoiceResponseMode';
import { downloadJson } from './utils/downloadJson';
import { Menu, HelpCircle, Volume2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import type { Message, MessageMode, PhotoAttachment } from './components/chat/types';

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
  const { speak, stop, isSpeaking, isSupported: ttsSupported } = useSpeechSynthesis();
  const { mode: voiceMode, setMode: setVoiceMode } = useVoiceResponseMode();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [capabilitiesOpen, setCapabilitiesOpen] = useState(false);
  const [voiceSettingsOpen, setVoiceSettingsOpen] = useState(false);
  const [composerValue, setComposerValue] = useState('');
  const lastMessageIdRef = useRef<string | null>(null);
  const [isGuestSession, setIsGuestSession] = useState(false);

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  // Track if we're in a guest session (messages exist but not authenticated)
  useEffect(() => {
    setIsGuestSession(!isAuthenticated && messages.length > 0);
  }, [isAuthenticated, messages.length]);

  // Show warning when voice mode is enabled but TTS is not supported
  useEffect(() => {
    if ((voiceMode === 'voice-text' || voiceMode === 'voice-only') && !ttsSupported) {
      toast.error('Text-to-speech is not supported in your browser. Voice features will not work.');
    }
  }, [voiceMode, ttsSupported]);

  // Load conversation entries when active conversation changes (only if authenticated)
  useEffect(() => {
    // Only load from backend if authenticated and we have entries
    if (isAuthenticated && activeEntries.length > 0) {
      const loadedMessages: Message[] = activeEntries.flatMap((entry, idx) => {
        const userMessage: Message = {
          id: `user-${idx}-${entry.timestamp.toString()}`,
          role: 'user' as const,
          content: entry.question,
          timestamp: new Date(Number(entry.timestamp) / 1000000)
        };

        // Add photo attachment if present
        if (entry.photo) {
          userMessage.photos = [{
            url: entry.photo.blob.getDirectURL(),
            filename: entry.photo.id
          }];
        }

        const assistantMessage: Message = {
          id: `assistant-${idx}-${entry.timestamp.toString()}`,
          role: 'assistant' as const,
          content: entry.response.summarizedAnswer,
          sources: entry.response.sources,
          timestamp: new Date(Number(entry.timestamp) / 1000000)
        };

        return [userMessage, assistantMessage];
      });

      setMessages(loadedMessages);
      // Reset last message ID when loading history to prevent auto-play
      lastMessageIdRef.current = loadedMessages.length > 0 
        ? loadedMessages[loadedMessages.length - 1].id 
        : null;
    } else if (isAuthenticated && activeEntries.length === 0 && activeConversationId !== null) {
      // Clear messages only if we explicitly switched to an empty conversation
      setMessages([]);
      lastMessageIdRef.current = null;
    }
    // Don't clear messages when not authenticated (preserve guest session)
  }, [activeEntries, isAuthenticated, activeConversationId]);

  const handleSendMessage = async (content: string, mode: MessageMode, photos?: File[]) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
      mode
    };

    // Add photo previews to user message
    if (photos && photos.length > 0) {
      userMessage.photos = photos.map(photo => ({
        url: URL.createObjectURL(photo),
        filename: photo.name
      }));
    }

    setMessages(prev => [...prev, userMessage]);

    try {
      const result = await fetchInformation(content);
      
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant' as const,
        content: result.summarizedAnswer,
        sources: result.sources,
        timestamp: new Date(),
        mode
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Auto-speak new assistant message if voice mode is enabled
      if ((voiceMode === 'voice-text' || voiceMode === 'voice-only') && ttsSupported) {
        // Only speak if this is a newly generated message (not from history load)
        if (lastMessageIdRef.current !== assistantMessage.id) {
          speak(result.summarizedAnswer);
          lastMessageIdRef.current = assistantMessage.id;
        }
      }

      // Save to backend if authenticated (only save first photo for now)
      if (isAuthenticated) {
        try {
          const photoToSave = photos && photos.length > 0 ? photos[0] : undefined;
          await saveEntry(content, result, photoToSave);
        } catch (error) {
          console.error('Failed to save entry:', error);
          // Don't show error to user - the message is still visible locally
        }
      }
    } catch (error) {
      const errorMessage: Message = {
        id: `assistant-error-${Date.now()}`,
        role: 'assistant' as const,
        content: mode === 'web-search' 
          ? 'Web search failed. Please check your internet connection and try again. If the problem persists, try rephrasing your query.'
          : 'I apologize, but I encountered an error while retrieving information. Please try again.',
        timestamp: new Date(),
        mode
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleNewConversation = async () => {
    if (!isAuthenticated) {
      // For guests, just clear the local messages
      setMessages([]);
      lastMessageIdRef.current = null;
      setSidebarOpen(false);
      return;
    }

    try {
      await startNewConversation();
      setMessages([]);
      lastMessageIdRef.current = null;
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
        {/* Desktop Sidebar - persistent on md+ (only when authenticated) */}
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

        {/* Mobile Sidebar - drawer (only when authenticated) */}
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
                {!isAuthenticated && (
                  <Badge variant="secondary" className="text-xs">
                    Guest
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                {isSpeaking && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={stop}
                    title="Stop speaking"
                    className="text-primary"
                  >
                    <Volume2 className="h-5 w-5 animate-pulse" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setVoiceSettingsOpen(true)}
                  title="Voice Settings"
                >
                  <Settings className="h-5 w-5" />
                </Button>
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

          {/* Guest mode info banner */}
          {!isAuthenticated && messages.length > 0 && (
            <Alert className="m-4 mb-0 border-blue-500/50 bg-blue-500/10">
              <AlertDescription className="text-sm">
                You're chatting as a guest. <button onClick={() => document.querySelector<HTMLButtonElement>('[data-login-button]')?.click()} className="underline font-medium">Log in</button> to save your conversation history and access it from any device.
              </AlertDescription>
            </Alert>
          )}

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
              <ConversationThread 
                messages={messages} 
                voiceMode={voiceMode}
                isSpeaking={isSpeaking}
                onSpeak={speak}
                onStop={stop}
              />
            )}

            {/* Chat composer - pinned to bottom */}
            <div className="border-t border-border bg-background">
              <div className="max-w-3xl mx-auto">
                <ChatComposer
                  value={composerValue}
                  onChange={setComposerValue}
                  onSendMessage={handleSendMessage}
                  isLoading={retrievalLoading}
                  disabled={false}
                />
              </div>
            </div>
          </main>
        </div>

        {/* Dialogs */}
        <ProfileSetupDialog open={showProfileSetup} />
        <CapabilitiesDialog open={capabilitiesOpen} onOpenChange={setCapabilitiesOpen} />
        <VoiceSettingsDialog 
          open={voiceSettingsOpen} 
          onOpenChange={setVoiceSettingsOpen}
          mode={voiceMode}
          onModeChange={setVoiceMode}
          isSupported={ttsSupported}
        />
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;
