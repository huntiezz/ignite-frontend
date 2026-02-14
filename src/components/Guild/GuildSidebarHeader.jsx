
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner'
import api from '@/api';
import { GuildsService } from '@/services/guilds.service';
import { PermissionsService } from '@/services/permissions.service';
import { Permissions } from '@/enums/Permissions';
import { CaretDown, Gear, UserPlus, SignOut } from '@phosphor-icons/react';
import InviteDialog from './InviteDialog';

const GuildSidebarHeader = ({ guildName = '', guild, onOpenServerSettings }) => {
    const navigate = useNavigate();

    const [menuOpen, setMenuOpen] = useState(false);
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
    const [leaving, setLeaving] = useState(false);

    const containerRef = useRef(null);

    useEffect(() => {
        if (!menuOpen) return;
        const onDown = (e) => {
            if (!containerRef.current) return;
            if (!containerRef.current.contains(e.target)) setMenuOpen(false);
        };
        const onKey = (e) => {
            if (e.key === 'Escape') setMenuOpen(false);
        };
        document.addEventListener('mousedown', onDown);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onDown);
            document.removeEventListener('keydown', onKey);
        };
    }, [menuOpen]);

    const canOpenServerSettings = useMemo(() => {
        return PermissionsService.hasPermission(guild?.id, null, Permissions.MANAGE_GUILD)
    }, [guild?.id]);

    const canInvite = useMemo(() => {
        return PermissionsService.hasPermission(guild?.id, null, Permissions.CREATE_INSTANT_INVITE)
    }, [guild?.id]);

    const handleLeave = useCallback(
        async (e) => {
            e.stopPropagation();
            if (!guild?.id || leaving) return;

            setLeaving(true);

            try {
                await api.delete(`@me/guilds/${guild.id}/`);
                toast.success('Left server.');
                setMenuOpen(false);
                navigate('/channels/@me');
                await GuildsService.loadGuilds();
            } catch (err) {
                const msg = err.response?.data?.message || err.message || 'Unknown error';
                toast.error(msg);
            } finally {
                setLeaving(false);
            }
        },
        [guild?.id, leaving, navigate]
    );

    return (
        <div className="relative w-full" ref={containerRef}>
            <button
                type="button"
                className="w-full cursor-pointer px-4 py-3 text-left transition-colors duration-100 hover:bg-gray-700"
                onClick={() => setMenuOpen((open) => !open)}
            >
                <div className="flex h-6 items-center">
                    <div className="flex-1 truncate text-base font-semibold">{guildName}</div>
                    <CaretDown className={`size-5 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>

            {menuOpen && (
                <div className="absolute inset-x-2 top-12 z-10 rounded bg-gray-700 py-2 shadow-lg border border-gray-600">
                    {canInvite && (<>
                        <button
                            type="button"
                            className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-gray-100 hover:bg-gray-600"
                            onClick={(e) => {
                                e.stopPropagation();
                                setMenuOpen(false);
                                setInviteDialogOpen(true);
                            }}
                        >
                            <span>Invite People</span>
                            <UserPlus className="size-4 ml-2" />
                        </button>

                        <hr className="my-1 border-gray-600" /></>
                    )}

                    {canOpenServerSettings && (<>
                        <button
                            type="button"
                            className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-gray-100 hover:bg-gray-600 disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:bg-gray-700"
                            onClick={() => {
                                setMenuOpen(false);
                                onOpenServerSettings?.();
                            }}
                        >
                            <span>Server Settings</span>
                            <Gear className="size-4 ml-2" />
                        </button>

                        <hr className="my-1 border-gray-600" />
                    </>
                    )}


                    <button
                        type="button"
                        className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-red-300 hover:bg-gray-600 disabled:opacity-60"
                        onClick={handleLeave}
                        disabled={leaving}
                    >
                        <span>{leaving ? 'Leaving…' : 'Leave Server'}</span>
                        <SignOut className="size-4 ml-2" />
                    </button>
                </div>
            )}

            <InviteDialog
                open={inviteDialogOpen}
                onOpenChange={setInviteDialogOpen}
                guildId={guild?.id}
            />
        </div>
    );
};

export default GuildSidebarHeader;
