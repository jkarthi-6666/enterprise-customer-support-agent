import { ChannelEnvelope, ChannelType, UserMessage } from '../types/domain';

/**
 * Interaction & Channel Gateway Contract (ADRs 0025–0027)
 */

export interface IChannelAdapter {
  readonly channel: ChannelType;
  normalizeInbound(rawPayload: Record<string, unknown>): Promise<ChannelEnvelope>;
  formatOutbound(envelope: ChannelEnvelope): Promise<Record<string, unknown>>;
}

export interface IInteractionGateway {
  ingest(channel: ChannelType, rawPayload: Record<string, unknown>): Promise<UserMessage>;
  deliver(envelope: ChannelEnvelope): Promise<void>;
  resolveSession(channel: ChannelType, channelIdentity: string): Promise<{ sessionId: string; userId: string }>;
}
