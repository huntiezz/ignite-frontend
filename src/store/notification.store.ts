import { create } from 'zustand';

type NotificationStore = {
  activeChannelId: string | null;
  blockedUserIds: string[];
  mutedChannelIds: string[];
  mutedGuildIds: string[];

  setActiveChannelId: (channelId: string | null) => void;
  setBlockedUserIds: (userIds: string[]) => void;
  setMutedChannelIds: (channelIds: string[]) => void;
  setMutedGuildIds: (guildIds: string[]) => void;
};

export const useNotificationStore = create<NotificationStore>((set) => ({
  activeChannelId: null,
  blockedUserIds: [],
  mutedChannelIds: [],
  mutedGuildIds: [],

  setActiveChannelId: (channelId) => set({ activeChannelId: channelId }),
  setBlockedUserIds: (userIds) => set({ blockedUserIds: userIds }),
  setMutedChannelIds: (channelIds) => set({ mutedChannelIds: channelIds }),
  setMutedGuildIds: (guildIds) => set({ mutedGuildIds: guildIds }),
}));
