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
  const { data: activeEntries = [] } = useGetConversationEntries(activeConversationId);

  // Only auto-select conversation when authenticated
  useEffect(() => {
    if (!identity) {
      // Clear active conversation when logged out
      setActiveConversationId(null);
      return;
    }

    // Auto-select the most recent conversation or create a new one
    if (conversationSummaries.length > 0 && activeConversationId === null) {
      const mostRecent = conversationSummaries.reduce((latest, current) => 
        current.lastUpdated > latest.lastUpdated ? current : latest
      );
      setActiveConversationId(mostRecent.id);
    } else if (conversationSummaries.length === 0 && activeConversationId === null) {
      // Create initial conversation when user first logs in
      createConversation('New conversation')
        .then(id => setActiveConversationId(id))
        .catch(err => console.error('Failed to create initial conversation:', err));
    }
  }, [conversationSummaries, activeConversationId, identity, createConversation]);

  const startNewConversation = async () => {
    if (!identity) {
      throw new Error('Not authenticated');
    }
    const newId = await createConversation('New conversation');
    setActiveConversationId(newId);
  };

  const switchConversation = (conversationId: bigint) => {
    setActiveConversationId(conversationId);
  };

  const saveEntry = async (question: string, response: Response, photo?: File) => {
    if (!identity || activeConversationId === null) {
      // Silently skip saving if not authenticated
      return;
    }

    // Generate title from first question if this is the first entry
    const title = activeEntries.length === 0 
      ? question.slice(0, 50) + (question.length > 50 ? '...' : '')
      : undefined;

    await addEntry({
      conversationId: activeConversationId,
      question,
      response,
      title,
      photo
    });
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
