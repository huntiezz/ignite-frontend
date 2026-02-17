import { GuildsService } from '../../services/guilds.service';
import { ChannelsService } from '../../services/channels.service';
import type { GatewayHandlerContext } from './types';

export function handleMemberJoined(data: any, context: GatewayHandlerContext): void {
  GuildsService.addGuildMemberToStore(context.guildId, data.member);
}

export function handleMemberUpdated(data: any, context: GatewayHandlerContext): void {
  GuildsService.updateGuildMemberInStore(context.guildId, data.member.user_id, data.member);
}

export function handleMemberLeft(data: any, context: GatewayHandlerContext): void {
  GuildsService.deleteGuildMemberFromStore(context.guildId, data.member.user_id);
}

export function handleMemberTyping(data: any, _context: GatewayHandlerContext): void {
  ChannelsService.handleMemberTyping(data);
}
