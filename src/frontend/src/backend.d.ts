import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface BlobRef {
    id: string;
    blob: ExternalBlob;
}
export interface ExportData {
    conversations: Array<ExportConversation>;
    profile?: UserProfile;
}
export interface ExportConversation {
    id: bigint;
    title: string;
    lastUpdated: bigint;
    entries: Array<QueryEntry>;
}
export interface Source {
    url: string;
    title: string;
    excerpt: string;
}
export interface QueryEntry {
    question: string;
    response: Response;
    timestamp: bigint;
    photo?: BlobRef;
}
export interface Response {
    summarizedAnswer: string;
    sources: Array<Source>;
}
export interface ConversationSummary {
    id: bigint;
    title: string;
    lastUpdated: bigint;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addQueryEntry(conversationId: bigint, question: string, response: Response, title: string | null, photo: BlobRef | null): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createConversation(title: string): Promise<bigint>;
    deleteConversationHistory(conversationId: bigint): Promise<void>;
    exportUserData(): Promise<ExportData>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getConversationEntries(conversationId: bigint): Promise<Array<QueryEntry>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listConversations(): Promise<Array<ConversationSummary>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
