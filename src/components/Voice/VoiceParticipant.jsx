import { MicrophoneSlash, SpeakerSlash } from '@phosphor-icons/react';
import Avatar from '../Avatar';
import { useUsersStore } from '@/store/users.store';
import { useVoiceStore } from '@/store/voice.store';
import useStore from '@/hooks/useStore';

const VoiceParticipant = ({ voiceState }) => {
  const currentUser = useUsersStore().getCurrentUser();
  const connectionState = useVoiceStore((s) => s.connectionState);
  const user = useUsersStore.getState().getUser(String(voiceState.user_id))
  const name = user?.name || user?.username || String(voiceState.user_id);

  const isLocalOnOtherDevice = String(voiceState.user_id) === String(currentUser?.id) && connectionState === 'disconnected';

  return (
    <div className={`mx-2 ml-7 flex items-center gap-2 rounded px-2 py-0.5 ${isLocalOnOtherDevice ? 'opacity-40' : ''}`}>
      {/* Speaking indicator ring */}
      <div
        className={`flex size-6 shrink-0 items-center justify-center rounded-full ${voiceState.speaking ? 'ring-2 ring-green-500' : ''
          }`}
      >
        <Avatar user={user || { name }} className="size-6 bg-gray-600 text-[10px] text-gray-300" />
      </div>

      <span className="flex-1 truncate text-[13px] text-gray-400">{name}</span>

      {voiceState.self_mute && <MicrophoneSlash className="size-3.5 shrink-0 text-gray-500" />}
      {voiceState.self_deaf && <SpeakerSlash className="size-3.5 shrink-0 text-gray-500" />}
      {voiceState.self_stream && (
        <span className="shrink-0 rounded-full bg-red-500 px-1 py-px text-[10px] font-bold uppercase leading-tight tracking-wide text-white">
          LIVE
        </span>
      )}
    </div>
  );
};

export default VoiceParticipant;
