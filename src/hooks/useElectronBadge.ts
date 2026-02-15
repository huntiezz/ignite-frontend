import { useEffect } from 'react';
import { useUnreadsStore } from '../store/unreads.store';
import { useChannelsStore } from '../store/channels.store';

/**
 * Keeps the Electron taskbar overlay badge in sync with unread state.
 *
 * Badge mapping:
 *  - 1–10: number of mentions (capped at 10)
 *  - 11: unread messages but zero mentions
 *  - 0/null: no unreads, clear badge
 */
export function useElectronBadge() {
  const channelUnreads = useUnreadsStore((s) => s.channelUnreads);
  const channelUnreadsLoaded = useUnreadsStore((s) => s.channelUnreadsLoaded);
  const channels = useChannelsStore((s) => s.channels);

  useEffect(() => {
    if (!window.IgniteNative?.setBadgeCount || !channelUnreadsLoaded) return;

    let totalMentions = 0;
    let hasUnread = false;

    for (const unread of channelUnreads) {
      totalMentions += unread.mentioned_message_ids?.length || 0;

      // Find the matching channel to compare last_message_id vs last_read_message_id
      const channel = channels.find(
        (c) => String(c.channel_id) === String(unread.channel_id)
      );

      if (!channel?.last_message_id || !unread.last_read_message_id) continue;

      const lastMessageTs = BigInt(channel.last_message_id) >> 22n;
      const lastReadTs = BigInt(unread.last_read_message_id) >> 22n;

      if (lastMessageTs > lastReadTs) {
        hasUnread = true;
      }
    }

    let badgeCount: number;
    if (totalMentions > 0) {
      badgeCount = Math.min(totalMentions, 10);
    } else if (hasUnread) {
      badgeCount = 11; // unread but no mentions
    } else {
      badgeCount = 0; // clear badge
    }

    window.IgniteNative.setBadgeCount(badgeCount);
  }, [channelUnreads, channelUnreadsLoaded, channels]);
}
