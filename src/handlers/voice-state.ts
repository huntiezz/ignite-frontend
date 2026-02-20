import { useVoiceStore } from '../store/voice.store';
import type { GatewayHandlerContext } from './types';

export function handleVoiceStateJoined(data: any, context: GatewayHandlerContext): void {
  useVoiceStore.getState().upsertVoiceState(data.channel_id, data);
}

export function handleVoiceStateUpdate(data: any, context: GatewayHandlerContext): void {
  useVoiceStore.getState().upsertVoiceState(data.channel_id, data);
}

export function handleVoiceStateLeft(data: any, context: GatewayHandlerContext): void {
  useVoiceStore.getState().removeVoiceState(data.user_id);
}
