import { useMemo } from 'react';
import { useGuildContext } from '../../../contexts/GuildContext';
import { useGuildsStore } from '../../../store/guilds.store';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Hash, Megaphone, SpeakerHigh } from '@phosphor-icons/react';

const ChannelMention = ({ channelId, isReply = false }) => {
  const { guildId } = useGuildContext();
  const guildsStore = useGuildsStore();
  const navigate = useNavigate();

  const channel = useMemo(() => {
    const guild = guildsStore.guilds.find((g) => g.id === guildId);
    if (guild) {
      const c = guild.channels.find((x) => x.id === channelId || x.channel_id === channelId);
      if (c) return { ...c, isSameGuild: true };
    }
    return null;
  }, [guildsStore.guilds, guildId, channelId]);

  if (!channel) {
    return (
      <span className="cursor-not-allowed rounded bg-gray-800/50 px-1 py-0.5 text-gray-500">
        #unknown-channel
      </span>
    );
  }

  if (isReply) {
    return (
      <span className="font-medium text-blue-400">
        #{channel.name}
      </span>
    );
  }

  const handleClick = (e) => {
    e.preventDefault();
    if (channel.isSameGuild) {
      navigate(`/channels/${guildId}/${channel.channel_id || channel.id}`);
    } else {
      toast.error('Channel belongs to another server');
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex cursor-pointer items-center gap-0.5 rounded bg-blue-500/10 px-1 py-0.5 align-baseline text-blue-400 hover:bg-blue-500/20 hover:text-blue-300"
    >
      {channel.type === 2 ? (
        <SpeakerHigh className="size-3.5" />
      ) : channel.type === 5 ? (
        <Megaphone weight="fill" className="size-3.5" />
      ) : (
        <Hash weight="bold" className="size-3.5" />
      )}
      <span className="font-medium hover:underline">{channel.name}</span>
    </button>
  );
};

export default ChannelMention;
