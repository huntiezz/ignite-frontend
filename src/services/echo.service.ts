import { useAuthStore } from '../store/auth.store';
import { FriendsService } from './friends.service';
import { UnreadsService } from './unreads.service';
import { ChannelsService } from './channels.service';
import { useUsersStore } from '../store/users.store';
import {
  handleChannelCreated,
  handleChannelDeleted,
  handleChannelPermissionDeleted,
  handleChannelPermissionUpdated,
  handleChannelUpdated,
  handleEmojiCreated,
  handleEmojiDeleted,
  handleGuildDeleted,
  handleGuildUpdated,
  handleMemberJoined,
  handleMemberLeft,
  handleMemberTyping,
  handleMemberUpdated,
  handleMessageCreated,
  handleMessageDeleted,
  handleMessageUpdated,
  handleRoleCreated,
  handleRoleDeleted,
  handleRoleUpdated,
  handleStickerCreated,
  handleStickerDeleted,
  handleUserUpdated,
  handleVoiceStateJoined,
  handleVoiceStateLeft,
  handleVoiceStateUpdate,
} from '../handlers/guild';

export const EchoService = {
  activeGuildSubscriptions: new Set<string>(),
  userChannelSubscription: null as any,

  subscribeToUserChannel(userId: string) {
    if (this.userChannelSubscription) {
      console.log('User channel already subscribed');
      return;
    }

    console.log(`Subscribing to private.user.${userId}`);

    this.userChannelSubscription = window.Echo.private(`user.${userId}`)
      .listen('.friendrequest.created', (event: any) => {
        console.log('Received friend request event:', event);
        FriendsService.loadRequests();
      })
      .listen('.friendrequest.deleted', (event: any) => {
        console.log('Friend request deleted event:', event);
        FriendsService.loadRequests();
      })
      .listen('.friendrequest.accepted', (event: any) => {
        console.log('Friend request accepted event:', event);
        FriendsService.loadFriends();
        FriendsService.loadRequests();
      })
      .listen('.unread.updated', (event: any) => {
        console.log('Unread updated event:', event);
        UnreadsService.updateUnread(event.unread.channel_id, event.unread);
      })
      .listen('.message.created', ChannelsService.handleMessageCreated)
      .listen('.message.updated', ChannelsService.handleMessageUpdated)
      .listen('.message.deleted', ChannelsService.handleMessageDeleted)
      .listen('.channel.created', ChannelsService.handleChannelCreated)
      .listen('.member.typing', ChannelsService.handleMemberTyping)
      .listen('.user.updated', (event: any) => {
        useUsersStore.getState().setUser(event.user.id, event.user);
      });
  },

  unsubscribeFromUserChannel(userId: string) {
    if (this.userChannelSubscription) {
      window.Echo.leave(`private-user.${userId}`);
      this.userChannelSubscription = null;
    }
  },

  subscribeToGuild(guildId: string) {
    if (this.activeGuildSubscriptions.has(guildId)) {
      return;
    }

    const currentUserId = useAuthStore.getState().userId;
    const context = { guildId, currentUserId };

    console.log(`Subscribing to guild: ${guildId}`);

    window.Echo.private(`guild.${guildId}`)
      .listen('.channel.created', (data: any) => handleChannelCreated(data, context))
      .listen('.channel.deleted', (data: any) => handleChannelDeleted(data, context))
      .listen('.channel.updated', (data: any) => handleChannelUpdated(data, context))
      .listen('.channel_permission.deleted', (data: any) => handleChannelPermissionDeleted(data, context))
      .listen('.channel_permission.updated', (data: any) => handleChannelPermissionUpdated(data, context))
      .listen('.emoji.created', (data: any) => handleEmojiCreated(data, context))
      .listen('.emoji.deleted', (data: any) => handleEmojiDeleted(data, context))
      .listen('.guild.deleted', (data: any) => handleGuildDeleted(data, context))
      .listen('.guild.updated', (data: any) => handleGuildUpdated(data, context))
      .listen('.member.joined', (data: any) => handleMemberJoined(data, context))
      .listen('.member.left', (data: any) => handleMemberLeft(data, context))
      .listen('.member.typing', (data: any) => handleMemberTyping(data, context))
      .listen('.member.updated', (data: any) => handleMemberUpdated(data, context))
      .listen('.message.created', (data: any) => handleMessageCreated(data, context))
      .listen('.message.deleted', (data: any) => handleMessageDeleted(data, context))
      .listen('.message.updated', (data: any) => handleMessageUpdated(data, context))
      .listen('.role.created', (data: any) => handleRoleCreated(data, context))
      .listen('.role.deleted', (data: any) => handleRoleDeleted(data, context))
      .listen('.role.updated', (data: any) => handleRoleUpdated(data, context))
      .listen('.sticker.created', (data: any) => handleStickerCreated(data, context))
      .listen('.sticker.deleted', (data: any) => handleStickerDeleted(data, context))
      .listen('.user.updated', (data: any) => handleUserUpdated(data, context))
      .listen('.voice_state.joined', (data: any) => handleVoiceStateJoined(data, context))
      .listen('.voice_state.left', (data: any) => handleVoiceStateLeft(data, context))
      .listen('.voice_state.update', (data: any) => handleVoiceStateUpdate(data, context));

    this.activeGuildSubscriptions.add(guildId);
  },

  subscribeToGuilds(guilds: any[]) {
    guilds.forEach((guild) => {
      this.subscribeToGuild(guild.id);
    });
  },

  unsubscribeFromGuild(guildId: string) {
    if (this.activeGuildSubscriptions.has(guildId)) {
      window.Echo.leave(`private-guild.${guildId}`);
      this.activeGuildSubscriptions.delete(guildId);
    }
  },

  unsubscribeAll() {
    const userId = useAuthStore.getState().userId;
    if (userId) {
      this.unsubscribeFromUserChannel(userId);
    }

    this.activeGuildSubscriptions.forEach((guildId) => {
      this.unsubscribeFromGuild(guildId);
    });
  },
};
