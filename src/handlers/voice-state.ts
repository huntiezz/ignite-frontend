import { useChannelsStore } from '../store/channels.store';
import type { GatewayHandlerContext } from './types';

export function handleVoiceStateJoined(data: any, context: GatewayHandlerContext): void {
  if (data.voice_state.user_id === context.currentUserId) return;
  useChannelsStore.getState().updateChannelVoiceState(data.channel_id, data);
}

export function handleVoiceStateUpdate(data: any, context: GatewayHandlerContext): void {
  if (data.voice_state.user_id === context.currentUserId) return;
  useChannelsStore.getState().updateChannelVoiceState(data.channel_id, data, false);
}

export function handleVoiceStateLeft(data: any, context: GatewayHandlerContext): void {
  if (data.voice_state.user_id === context.currentUserId) return;
  useChannelsStore.getState().removeUserVoiceState(data.user_id);
}
