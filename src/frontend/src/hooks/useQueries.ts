import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, ConversationSummary, QueryEntry, Response, ExportData, BlobRef } from '../backend';
import { ExternalBlob } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useListConversations() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ConversationSummary[]>({
    queryKey: ['conversations'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listConversations();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateConversation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (title: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createConversation(title);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useGetConversationEntries(conversationId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<QueryEntry[]>({
    queryKey: ['conversationEntries', conversationId?.toString()],
    queryFn: async () => {
      if (!actor || conversationId === null) return [];
      return actor.getConversationEntries(conversationId);
    },
    enabled: !!actor && !actorFetching && conversationId !== null,
  });
}

export function useAddQueryEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      conversationId, 
      question, 
      response,
      title,
      photo
    }: { 
      conversationId: bigint; 
      question: string; 
      response: Response;
      title?: string;
      photo?: File;
    }) => {
      if (!actor) throw new Error('Actor not available');
      
      let blobRef: BlobRef | null = null;
      
      // Convert photo to BlobRef if provided
      if (photo) {
        const arrayBuffer = await photo.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        const externalBlob = ExternalBlob.fromBytes(bytes);
        
        blobRef = {
          id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          blob: externalBlob
        };
      }
      
      return actor.addQueryEntry(conversationId, question, response, title || null, blobRef);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversationEntries', variables.conversationId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useDeleteConversationHistory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteConversationHistory(conversationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useExportUserData() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (): Promise<ExportData> => {
      if (!actor) throw new Error('Actor not available');
      return actor.exportUserData();
    },
  });
}
