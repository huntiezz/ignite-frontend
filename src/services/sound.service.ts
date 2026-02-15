import notificationSound from '../assets/notification.wav';

/**
 * Low-level sound playback service.
 *
 * Plays notification sounds and coordinates across browser tabs via
 * BroadcastChannel so the same message only triggers one sound.
 */
const notificationAudio = new Audio(notificationSound);
const notificationChannel =
  typeof BroadcastChannel !== 'undefined'
    ? new BroadcastChannel('ignite:notification-sound')
    : null;
const recentlyPlayed = new Set<string>();

// When another tab plays the sound, mark that message as handled
notificationChannel?.addEventListener('message', (event) => {
  if (event.data?.type === 'played') {
    recentlyPlayed.add(event.data.id);
  }
});

export const SoundService = {
  /**
   * Play the notification sound for a given message ID.
   * Deduplicates across tabs via BroadcastChannel.
   */
  playNotificationSound(messageId: string) {
    if (recentlyPlayed.has(messageId)) return;

    recentlyPlayed.add(messageId);
    notificationChannel?.postMessage({ type: 'played', id: messageId });

    notificationAudio.currentTime = 0;
    notificationAudio.play().catch(() => {});

    // Cleanup old IDs after 10s so the set doesn't grow forever
    setTimeout(() => recentlyPlayed.delete(messageId), 10000);
  },
};
