import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../../hooks/useStore';
import {
  UserCheck,
  UserMinus,
  UserPlus,
  UserX,
  Smile,
  Clock,
  PawPrint,
  Pizza,
  Trophy,
  Plane,
  Lightbulb,
  Shapes,
} from 'lucide-react';
import Avatar from '../Avatar';
import { FriendsService } from '../../services/friends.service';
import { ChannelsService } from '../../services/channels.service';
import { useFriendsStore } from '../../store/friends.store';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { DotsThree, Prohibit, UserCircle } from '@phosphor-icons/react';
import {
  EmojiPicker,
  EmojiPickerContent,
  EmojiPickerSearch,
  EmojiPickerSidebar,
} from '../ui/emoji-picker';
import emojisData from '../../assets/emojis/emojis.json';
import { useEmojisStore } from '../../store/emojis.store';
import { toast } from 'sonner';
import UserProfileModal from '../UserProfileModal';
import { useUsersStore } from '@/store/users.store';
import { useGuildContext } from '../../contexts/GuildContext';
import { useGuildsStore } from '../../store/guilds.store';

const GuildMemberPopoverContent = ({ userId, onOpenProfile }) => {
  const store = useStore();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [emojiSearch, setEmojiSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('people');

  const { recentEmojis, addRecentEmoji } = useEmojisStore();

  useEffect(() => {
    // Focus after a tiny delay to ensure Radix has finished its own focus management
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);
  const { friends, requests } = useFriendsStore();
  const { getUser } = useUsersStore();
  const { guildId } = useGuildContext();
  const { guildMembers } = useGuildsStore();

  const user = useMemo(() => getUser(userId), [userId, getUser]);

  const member = useMemo(() => {
    if (!guildId) return null;
    return (guildMembers[guildId] || []).find((m) => m.user_id === userId);
  }, [guildId, guildMembers, userId]);

  const roles = useMemo(() => {
    const r = member?.roles || user?.roles || [];
    return [...r].sort((a, b) => (b.position || 0) - (a.position || 0));
  }, [member, user]);

  const getRoleColor = (color) => {
    if (!color || color === 0) return '#5865f2';
    return typeof color === 'number' ? `#${color.toString(16).padStart(6, '0')}` : color;
  };

  const isFriend = useMemo(() => {
    if (!user) return false;
    return friends.some((friend) => friend.id === user.id);
  }, [friends, user]);

  const hasSentRequest = useMemo(() => {
    if (!user) return false;
    return requests.some((request) => request.receiver_id === user.id);
  }, [requests, user]);

  const hasReceivedRequest = useMemo(() => {
    if (!user) return false;
    return requests.some((request) => request.sender_id === user.id);
  }, [requests, user]);

  const friendRequestId = useMemo(() => {
    if (!user) return null;
    const request = requests.find(
      (request) => request.sender_id === user.id || request.receiver_id === user.id
    );
    return request ? request.id : null;
  }, [requests, user]);

  if (!user) return null;

  const handleAddFriend = async () => {
    try {
      await FriendsService.sendRequest(user.username);
      toast.success(`Friend request sent to ${user.username}`);
    } catch {
      toast.error('Failed to send friend request');
    }
  };

  const handleRemoveFriend = async () => {
    try {
      await FriendsService.removeFriend(user.id);
      toast.success(`Removed ${user.username} from friends`);
    } catch {
      toast.error('Failed to remove friend');
    }
  };

  const handleCancelRequest = async () => {
    if (!friendRequestId) return;
    try {
      await FriendsService.cancelRequest(friendRequestId);
      toast.success('Friend request cancelled');
    } catch {
      toast.error('Failed to cancel request');
    }
  };

  const handleAcceptRequest = async () => {
    if (!friendRequestId) return;
    try {
      await FriendsService.acceptRequest(friendRequestId);
      toast.success(`You are now friends with ${user.username}`);
    } catch {
      toast.error('Failed to accept request');
    }
  };

  const handleSendMessage = async () => {
    const text = message.trim();
    if (!text) return;

    try {
      const channel = await ChannelsService.createPrivateChannel([userId]);
      if (channel) {
        navigate(`/channels/@me/${channel.channel_id}`, { state: { initialMessage: text } });
        setMessage('');
        toast.info(`Starting conversation with ${user.username}`);
      }
    } catch {
      toast.error('Failed to start conversation');
    }
  };

  const onEmojiSelect = (emoji) => {
    let emojiChar;
    if (emoji.url) {
      emojiChar = emoji.id ? `<${emoji.id}:${emoji.label}>` : `:${emoji.label}:`;
    } else {
      emojiChar = emoji.emoji;
    }

    setMessage((prev) => prev + emojiChar);

    addRecentEmoji({
      label: emoji.label,
      surrogates: emoji.emoji,
      url: emoji.url,
      isCustom: !!emoji.url,
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(user.id);
    toast.success('Copied User ID');
  };

  const handleBlock = () => {
    toast.info('Block feature coming soon!');
  };

  console.log(user);

  return (
    <>
      <div className="w-80 overflow-hidden rounded-lg bg-[#111214] shadow-xl">
        <div className="relative h-28">
          <div
            className="h-full bg-primary"
            style={{
              backgroundColor: user.banner_color,
              backgroundImage: user.banner_url ? `url(${user.banner_url})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />

          <div className="absolute -bottom-12 left-4">
            <button
              type="button"
              onClick={() => (onOpenProfile ? onOpenProfile() : setProfileModalOpen(true))}
              className="group relative rounded-full"
            >
              <Avatar user={user} className="size-20 !cursor-pointer text-3xl" />
              {user.status === 'online' && (
                <div className="absolute bottom-1 right-1 z-10 size-6 rounded-full border-4 border-[#111214] bg-[#23a559]" />
              )}

              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition group-hover:opacity-100">
                <span className="text-[10px] font-bold uppercase text-white drop-shadow-md">
                  View Profile
                </span>
              </div>
            </button>
          </div>

          <div className="absolute right-3 top-3 flex items-center gap-2">
            {user.id !== store.user?.id && (
              <>
                {!isFriend && !hasSentRequest && !hasReceivedRequest && (
                  <button
                    type="button"
                    onClick={handleAddFriend}
                    className="flex items-center justify-center rounded-md bg-black/50 p-2 text-white/90 backdrop-blur-sm transition hover:bg-black/70"
                    title="Add Friend"
                  >
                    <UserPlus className="size-4" />
                  </button>
                )}
                {isFriend && (
                  <button
                    type="button"
                    onClick={handleRemoveFriend}
                    className="flex items-center justify-center rounded-md bg-black/50 p-2 text-white/90 backdrop-blur-sm transition hover:bg-black/70"
                    title="Remove Friend"
                  >
                    <UserMinus className="size-4" />
                  </button>
                )}
                {hasSentRequest && (
                  <button
                    type="button"
                    onClick={handleCancelRequest}
                    className="flex items-center justify-center rounded-md bg-black/50 p-2 text-white/90 backdrop-blur-sm transition hover:bg-black/70"
                    title="Cancel Friend Request"
                  >
                    <UserX className="size-4" />
                  </button>
                )}
                {hasReceivedRequest && (
                  <button
                    type="button"
                    onClick={handleAcceptRequest}
                    className="flex items-center justify-center rounded-md bg-green-600/90 p-2 text-white backdrop-blur-sm transition hover:bg-green-600"
                    title="Accept Friend Request"
                  >
                    <UserCheck className="size-4" />
                  </button>
                )}
              </>
            )}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex cursor-pointer items-center justify-center rounded-md bg-black/50 p-2 text-white/90 backdrop-blur-sm transition hover:bg-black/70"
                  title="More Options"
                >
                  <DotsThree className="size-4" weight="bold" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-48 rounded-md border-white/5 bg-[#111214] p-1 shadow-xl"
              >
                <div className="flex flex-col gap-0.5">
                  {/* Reuse logic from UserProfileModal */}
                  {isFriend && (
                    <button
                      onClick={handleRemoveFriend}
                      className="flex w-full items-center justify-between rounded px-2 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10"
                    >
                      Remove Friend
                      <UserMinus size={14} />
                    </button>
                  )}
                  {hasSentRequest && (
                    <button
                      onClick={handleCancelRequest}
                      className="flex w-full items-center justify-between rounded px-2 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10"
                    >
                      Cancel Friend Request
                      <UserMinus size={14} />
                    </button>
                  )}
                  <button
                    onClick={handleBlock}
                    className="flex w-full items-center justify-between rounded px-2 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-500/10"
                  >
                    Block
                    <Prohibit size={14} />
                  </button>
                  <div className="my-0.5 h-px bg-white/5" />
                  <button
                    onClick={handleCopyId}
                    className="flex w-full items-center justify-between rounded px-2 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-white/5"
                  >
                    Copy User ID
                    <UserCircle size={14} />
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="mt-14 px-4 pb-4">
          <div className="rounded-md bg-[#111214] p-1">
            <h2 className="flex items-center gap-1.5 text-lg font-bold text-white">{user.name}</h2>
            <p className="text-xs font-medium text-gray-300">{user.username}</p>

            <div className="mt-3">
              <h3 className="mb-1 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                About Me
              </h3>
              <p className="text-[13px] leading-relaxed text-gray-300">
                {user.bio || 'No description provided.'}
              </p>
            </div>

            <div className="mt-3">
              <h3 className="mb-1 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Member Since
              </h3>
              <p className="text-[13px] text-gray-300">
                {user.created_at
                  ? new Date(user.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Feb 8, 2026'}
              </p>
            </div>

            {roles.length > 0 && (
              <div className="mt-3">
                <h3 className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Roles
                </h3>
                <div className="flex flex-wrap gap-1">
                  {roles.map((role) => (
                    <span
                      key={role.id}
                      className="flex items-center gap-1 rounded bg-[#2b2d31] px-2 py-0.5 text-[11px] font-bold text-gray-200"
                    >
                      <div
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: getRoleColor(role.color) }}
                      />
                      {role.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4">
              <div className="relative flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={message}
                  onKeyDown={handleKeyDown}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Message @${user.name ?? user.username}`}
                  className="w-full rounded bg-[#383a40] py-2 pl-3 pr-10 text-[13px] text-gray-100 outline-none placeholder:text-[#949ba4]"
                />
                <div className="absolute right-3 flex items-center text-[#b5bac1] hover:text-[#dbdee1]">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Smile size={20} weight="fill" className="cursor-pointer" />
                    </PopoverTrigger>
                    <PopoverContent
                      side="top"
                      align="end"
                      sideOffset={12}
                      className="z-[1100] h-[430px] w-[452px] border-none bg-transparent p-0 shadow-none"
                    >
                      <EmojiPicker className="flex size-full flex-row">
                        <EmojiPickerSidebar
                          activeCategory={activeCategory}
                          onCategorySelect={(id) => {
                            setActiveCategory(id);
                            const viewport = document.querySelector(
                              '[data-slot="emoji-picker-viewport"]'
                            );
                            if (viewport) {
                              if (id === 'recent') {
                                viewport.scrollTo({ top: 0, behavior: 'smooth' });
                              } else {
                                const el = document.getElementById(`category-${id}`);
                                if (el)
                                  viewport.scrollTo({ top: el.offsetTop, behavior: 'smooth' });
                              }
                            }
                          }}
                          categories={[
                            {
                              id: 'recent',
                              label: 'Recent',
                              icon: <Clock className="size-[20px]" />,
                            },
                            {
                              id: 'people',
                              label: 'People',
                              icon: <Smile className="size-[20px]" />,
                            },
                            {
                              id: 'nature',
                              label: 'Nature',
                              icon: <PawPrint className="size-[20px]" />,
                            },
                            { id: 'food', label: 'Food', icon: <Pizza className="size-[20px]" /> },
                            {
                              id: 'activity',
                              label: 'Activities',
                              icon: <Trophy className="size-[20px]" />,
                            },
                            {
                              id: 'travel',
                              label: 'Travel',
                              icon: <Plane className="size-[20px]" />,
                            },
                            {
                              id: 'objects',
                              label: 'Objects',
                              icon: <Lightbulb className="size-[20px]" />,
                            },
                            {
                              id: 'symbols',
                              label: 'Symbols',
                              icon: <Shapes className="size-[20px]" />,
                            },
                          ]}
                        />
                        <div className="flex min-w-0 flex-1 flex-col bg-[#2b2d31]">
                          <EmojiPickerSearch
                            value={emojiSearch}
                            onChange={(e) => setEmojiSearch(e.target.value)}
                          />
                          <EmojiPickerContent
                            searchValue={emojiSearch}
                            standardEmojis={emojisData}
                            recentEmojis={recentEmojis}
                            onCategoryVisible={setActiveCategory}
                            onEmojiSelect={onEmojiSelect}
                          />
                        </div>
                      </EmojiPicker>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!onOpenProfile && (
        <UserProfileModal user={user} open={profileModalOpen} onOpenChange={setProfileModalOpen} />
      )}
    </>
  );
};

export default GuildMemberPopoverContent;
