/**
 * Memory & State Store Contract (ADR 0005 Boundary Definition)
 */

export interface SessionTurn {
  turnId: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  timestamp: string;
}

export interface UserProfileMemory {
  userId: string;
  preferredLanguage?: string;
  tier: 'standard' | 'premium' | 'enterprise';
  customPreferences: Record<string, unknown>;
}

export interface IMemoryStateStore {
  /**
   * Session Conversation State (Read/Write per turn)
   */
  getConversationHistory(sessionId: string, limit?: number): Promise<SessionTurn[]>;
  appendTurn(sessionId: string, turn: SessionTurn): Promise<void>;

  /**
   * User Profile & Preferences
   */
  getUserProfile(userId: string): Promise<UserProfileMemory>;
  updateUserProfile(userId: string, updates: Partial<UserProfileMemory>): Promise<void>;

  /**
   * Working Memory / Run Scratchpad
   */
  getWorkingMemory<T>(sessionId: string, key: string): Promise<T | null>;
  setWorkingMemory<T>(sessionId: string, key: string, value: T, ttlSeconds?: number): Promise<void>;
  clearWorkingMemory(sessionId: string): Promise<void>;
}
