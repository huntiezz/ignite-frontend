import { GuildsService } from '../../services/guilds.service';
import type { GatewayHandlerContext } from './types';

export function handleGuildUpdated(data: any, _context: GatewayHandlerContext): void {
  GuildsService.handleGuildUpdated(data);
}

export function handleGuildDeleted(data: any, _context: GatewayHandlerContext): void {
  GuildsService.handleGuildDeleted(data);
}
