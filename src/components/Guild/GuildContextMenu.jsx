import { Copy, Check, SignOut, UserPlus, BellSlash, Bell, SpeakerSimpleSlash } from '@phosphor-icons/react';
import { toast } from 'sonner';
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuLabel,
} from '../ui/context-menu';
import { UnreadsService } from '../../services/unreads.service';
import { ChannelsService } from '../../services/channels.service';
import { GuildSettingsService } from '../../services/guild-settings.service';
import { useChannelsStore } from '../../store/channels.store';
import { useUnreadsStore } from '../../store/unreads.store';
import { useNotificationStore } from '../../store/notification.store';
import { isChannelUnread } from '../../utils/unreads.utils';

const MUTE_DURATIONS = [
  { label: 'For 15 Minutes', minutes: 15 },
  { label: 'For 1 Hour', minutes: 60 },
  { label: 'For 3 Hours', minutes: 180 },
  { label: 'For 8 Hours', minutes: 480 },
  { label: 'For 24 Hours', minutes: 1440 },
  { label: 'Until I turn it back on', minutes: null },
];

const GuildContextMenu = ({ guild, onLeave, onInvite }) => {
  const { channels } = useChannelsStore();
  const { channelUnreads } = useUnreadsStore();
  const { guildSettings } = useNotificationStore();

  const settings = guildSettings[guild.id] || {};
  const isMuted = settings.muted_until === 'forever' ||
    (settings.muted_until && new Date(settings.muted_until) > new Date());

  const handleMarkAsRead = () => {
    const guildChannels = channels.filter((c) => c.guild_id === guild.id);

    const unreadChannels = guildChannels.filter((c) =>
      isChannelUnread(c, channelUnreads, true)
    );

    if (unreadChannels.length === 0) {
        toast.info('Server is already read.');
        return;
    }

    unreadChannels.forEach((c) => {
      if (c.last_message_id) {
        UnreadsService.setLastReadMessageId(c.channel_id, c.last_message_id);
        ChannelsService.acknowledgeChannelMessage(c.channel_id, c.last_message_id);
      }
    });

    toast.success('Marked server as read');
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(guild.id);
    toast.success('Copied Server ID');
  };

  const handleLeaveServer = () => {
    onLeave && onLeave();
  };

  const handleInvite = () => {
    onInvite && onInvite();
  };

  const handleMute = (minutes) => {
    let muted_until;
    if (minutes === null) {
      muted_until = 'forever';
    } else {
      const date = new Date();
      date.setMinutes(date.getMinutes() + minutes);
      muted_until = date.toISOString();
    }
    GuildSettingsService.updateGuildSettings(guild.id, { muted_until });
  };

  const handleUnmute = () => {
    GuildSettingsService.updateGuildSettings(guild.id, { muted_until: null });
  };

  const handleNotificationChange = (value) => {
    GuildSettingsService.updateGuildSettings(guild.id, { message_notifications: Number(value) });
  };

  const handleToggleSuppressEveryone = () => {
    GuildSettingsService.updateGuildSettings(guild.id, {
      suppress_everyone: !settings.suppress_everyone
    });
  };

  const handleToggleSuppressRoles = () => {
    GuildSettingsService.updateGuildSettings(guild.id, {
      suppress_roles: !settings.suppress_roles
    });
  };

  const handleToggleHideMuted = () => {
    GuildSettingsService.updateGuildSettings(guild.id, {
      hide_muted_channels: !settings.hide_muted_channels
    });
  };

  return (
    <ContextMenuContent className="w-56">
      <ContextMenuItem onClick={handleMarkAsRead} className="cursor-pointer">
        <Check className="mr-2 size-4" />
        Mark As Read
      </ContextMenuItem>

      <ContextMenuSeparator />

      <ContextMenuItem onClick={handleInvite} className="cursor-pointer">
        <UserPlus className="mr-2 size-4" />
        Invite People
      </ContextMenuItem>

      <ContextMenuSeparator />

      {/* Mute Server */}
      {isMuted ? (
        <ContextMenuItem onClick={handleUnmute} className="cursor-pointer">
          <Bell className="mr-2 size-4" />
          Unmute Server
        </ContextMenuItem>
      ) : (
        <ContextMenuSub>
          <ContextMenuSubTrigger className="cursor-pointer">
            <BellSlash className="mr-2 size-4" />
            Mute Server
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            {MUTE_DURATIONS.map((option) => (
              <ContextMenuItem
                key={option.label}
                onClick={() => handleMute(option.minutes)}
                className="cursor-pointer"
              >
                {option.label}
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>
      )}

      {/* Notification Settings */}
      <ContextMenuSub>
        <ContextMenuSubTrigger className="cursor-pointer">
          <SpeakerSimpleSlash className="mr-2 size-4" />
          Notification Settings
        </ContextMenuSubTrigger>
        <ContextMenuSubContent className="w-52">
          <ContextMenuLabel>Message Notifications</ContextMenuLabel>
          <ContextMenuRadioGroup
            value={String(settings.message_notifications ?? 0)}
            onValueChange={handleNotificationChange}
          >
            <ContextMenuRadioItem value="0" className="cursor-pointer" onSelect={(e) => e.preventDefault()}>
              All Messages
            </ContextMenuRadioItem>
            <ContextMenuRadioItem value="1" className="cursor-pointer" onSelect={(e) => e.preventDefault()}>
              Only @mentions
            </ContextMenuRadioItem>
            <ContextMenuRadioItem value="2" className="cursor-pointer" onSelect={(e) => e.preventDefault()}>
              Nothing
            </ContextMenuRadioItem>
          </ContextMenuRadioGroup>

          <ContextMenuSeparator />

          <ContextMenuCheckboxItem
            checked={settings.suppress_everyone ?? false}
            onCheckedChange={handleToggleSuppressEveryone}
            onSelect={(e) => e.preventDefault()}
            className="cursor-pointer"
          >
            Suppress @everyone
          </ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem
            checked={settings.suppress_roles ?? false}
            onCheckedChange={handleToggleSuppressRoles}
            onSelect={(e) => e.preventDefault()}
            className="cursor-pointer"
          >
            Suppress @roles
          </ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem
            checked={settings.hide_muted_channels ?? false}
            onCheckedChange={handleToggleHideMuted}
            onSelect={(e) => e.preventDefault()}
            className="cursor-pointer"
          >
            Hide Muted Channels
          </ContextMenuCheckboxItem>
        </ContextMenuSubContent>
      </ContextMenuSub>

      <ContextMenuSeparator />

      <ContextMenuItem onClick={handleCopyId} className="cursor-pointer">
        <Copy className="mr-2 size-4" />
        Copy Server ID
      </ContextMenuItem>

      <ContextMenuSeparator />

      <ContextMenuItem
        onClick={handleLeaveServer}
        className="cursor-pointer text-red-500 focus:bg-red-500/10 focus:text-red-500"
      >
        <SignOut className="mr-2 size-4" />
        Leave Server
      </ContextMenuItem>
    </ContextMenuContent>
  );
};

export default GuildContextMenu;
