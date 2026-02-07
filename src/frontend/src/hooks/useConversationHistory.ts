import { useState, useEffect } from 'react';
import { 
  useListConversations, 
  useCreateConversation, 
  useGetConversationEntries,
  useAddQueryEntry 
} from './useQueries';
import { useInternetIdentity } from './useInternetIdentity';
import type { ConversationSummary, Response } from '../backend';

export function useConversationHistory() {
  const { identity } = useInternetIdentity();
  const { data: conversationSummaries = [] } = useListConversations();
  const { mutateAsync: createConversation } = useCreateConversation();
  const { mutateAsync: addEntry } = useAddQueryEntry();
  
  const [activeConversationId, setActiveConversationId] = useState<bigint | null>(null);

  const isAuthenticated = !!identity;

  // Load entries for the active conversation
  const { data: activeEntries = [] } = useGetConversationEntries(activeConversationId);

  // Clear conversation state when unauthenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setActiveConversationId(null);
    }
  }, [isAuthenticated]);

  // Auto-select first conversation if none is active
  useEffect(() => {
    if (isAuthenticated && conversationSummaries.length > 0 && activeConversationId === null) {
      setActiveConversationId(conversationSummaries[0].id);
    }
  }, [conversationSummaries, activeConversationId, isAuthenticated]);

  const saveEntry = async (question: string, response: Response) => {
    if (!isAuthenticated || activeConversationId === null) return;
    
    try {
      // Generate title from first question if conversation is empty
      const title = activeEntries.length === 0 ? question.slice(0, 50) : undefined;
      await addEntry({ 
        conversationId: activeConversationId, 
        question, 
        response,
        title 
      });
    } catch (error) {
      console.error('Failed to save conversation entry:', error);
      throw error;
    }
  };

  const startNewConversation = async () => {
    if (!isAuthenticated) return;
    
    try {
      const newId = await createConversation('New conversation');
      setActiveConversationId(newId);
    } catch (error) {
      console.error('Failed to create conversation:', error);
      throw error;
    }
  };

  const switchConversation = (conversationId: bigint) => {
    setActiveConversationId(conversationId);
  };

  return {
    activeConversationId,
    activeEntries,
    conversationSummaries,
    switchConversation,
    startNewConversation,
    saveEntry
  };
}
