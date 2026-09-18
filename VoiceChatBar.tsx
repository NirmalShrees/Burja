import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Headphones,
  Volume2,
  VolumeX,
  PhoneOff,
  Settings,
  Radio,
  Users,
  Sparkles,
  Volume1,
} from 'lucide-react';
import { voiceService, VoiceState } from '../services/voiceService';
import { VoiceSettingsModal } from './VoiceSettingsModal';

interface VoiceChatBarProps {
  roomId?: string | null;
  currentUser?: { id: string; username: string; avatar: string } | null;
  className?: string;
}

export const VoiceChatBar: React.FC<VoiceChatBarProps> = ({
  roomId,
  currentUser,
  className = '',
}) => {
  const [voiceState, setVoiceState] = useState<VoiceState>(voiceService.getState());
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const unsubscribe = voiceService.subscribe((state) => {
      setVoiceState(state);
    });
    return () => unsubscribe();
  }, []);

  const handleJoinVoice = async () => {
    if (!roomId || !currentUser) return;
    await voiceService.joinVoice(roomId, currentUser);
  };

  const handleLeaveVoice = () => {
    voiceService.leaveVoice();
  };

  const handleToggleMute = () => {
    voiceService.toggleMute();
  };

  const handleToggleDeafen = () => {
    voiceService.toggleDeafen();
  };

  if (!roomId || !currentUser) return null;

  const connectedPeers = Object.values(voiceState.peers);
  const speakingPeers = connectedPeers.filter((p) => p.isSpeaking);

  return (
    <>
      <div
        id="voice-chat-bar"
        className={`flex items-center justify-between gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-gradient-to-r from-[#0d1527]/90 via-[#0a101d]/90 to-[#070b14]/90 border border-amber-500/25 shadow-lg backdrop-blur-sm transition-all duration-300 ${className}`}
      >
        {!voiceState.isConnected ? (
          // Disconnected / Join Voice Prompt State
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Mic className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-slate-200 flex items-center gap-1 truncate">
                  <span>Table Voice Chat</span>
                  <span className="text-[8px] font-mono px-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    LIVE
                  </span>
                </div>
                <div className="text-[9px] text-slate-400 truncate hidden xs:block">
                  Talk with other players in real-time
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleJoinVoice}
              disabled={voiceState.isConnecting}
              className="px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-md hover:shadow-emerald-900/40 transition-all cursor-pointer disabled:opacity-50 shrink-0"
              title="Join Voice Chat"
            >
              {voiceState.isConnecting ? (
                <>
                  <span className="w-2.5 h-2.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Mic className="w-3 h-3" />
                  <span>Join Voice</span>
                </>
              )}
            </button>
          </div>
        ) : (
          // Connected Voice Controls Bar
          <div className="flex items-center justify-between w-full gap-2">
            {/* Left Status & Speaker Pill */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-300 hidden sm:inline">
                  VOICE
                </span>
                <span className="text-[9px] font-mono text-slate-400 flex items-center gap-0.5">
                  <Users className="w-2.5 h-2.5" />
                  <span>{connectedPeers.length + 1}</span>
                </span>
              </div>

              {/* Active Speaker Badge */}
              {voiceState.isSpeaking ? (
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[9.5px] font-medium animate-pulse truncate max-w-[120px] sm:max-w-[180px]">
                  <Radio className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                  <span className="truncate">You are speaking...</span>
                </div>
              ) : speakingPeers.length > 0 ? (
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[9.5px] font-medium animate-pulse truncate max-w-[120px] sm:max-w-[180px]">
                  <Volume2 className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                  <span className="truncate">{speakingPeers.map((p) => p.username).join(', ')} speaking...</span>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-1 text-[9px] text-slate-500 truncate">
                  <span>Room Audio Live</span>
                </div>
              )}
            </div>

            {/* Right Quick Controls */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {/* Audio visualizer bar when talking */}
              {!voiceState.isMuted && (
                <div
                  className="hidden xs:flex items-center gap-0.5 h-4 px-1 rounded bg-slate-950/60 border border-slate-800"
                  title={`Mic Level: ${voiceState.localVolumeLevel}%`}
                >
                  <span
                    className={`w-1 rounded-full transition-all duration-75 ${
                      voiceState.localVolumeLevel > 15 ? 'bg-emerald-400 h-3' : 'bg-slate-700 h-1'
                    }`}
                  />
                  <span
                    className={`w-1 rounded-full transition-all duration-75 ${
                      voiceState.localVolumeLevel > 35 ? 'bg-emerald-400 h-3.5' : 'bg-slate-700 h-1'
                    }`}
                  />
                  <span
                    className={`w-1 rounded-full transition-all duration-75 ${
                      voiceState.localVolumeLevel > 65 ? 'bg-amber-400 h-4' : 'bg-slate-700 h-1'
                    }`}
                  />
                </div>
              )}

              {/* Mute Mic Button */}
              <button
                type="button"
                onClick={handleToggleMute}
                className={`p-1.5 sm:px-2 sm:py-1 rounded-lg border text-xs flex items-center gap-1 font-bold transition-all cursor-pointer shadow-sm ${
                  voiceState.isMuted
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 hover:bg-rose-500/30'
                    : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                }`}
                title={voiceState.isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
              >
                {voiceState.isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline text-[10px]">{voiceState.isMuted ? 'Muted' : 'Mute'}</span>
              </button>

              {/* Deafen (Mute Incoming Voice) */}
              <button
                type="button"
                onClick={handleToggleDeafen}
                className={`p-1.5 sm:px-2 sm:py-1 rounded-lg border text-xs flex items-center gap-1 font-bold transition-all cursor-pointer shadow-sm ${
                  voiceState.isDeafened
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 hover:bg-rose-500/30'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
                title={voiceState.isDeafened ? 'Undeafen Voice Audio' : 'Deafen Voice Audio'}
              >
                {voiceState.isDeafened ? <VolumeX className="w-3.5 h-3.5" /> : <Headphones className="w-3.5 h-3.5" />}
                <span className="hidden md:inline text-[10px]">{voiceState.isDeafened ? 'Deafened' : 'Deafen'}</span>
              </button>

              {/* Voice Settings */}
              <button
                type="button"
                onClick={() => setShowSettings(true)}
                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
                title="Voice Settings & Audio Mixer"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>

              {/* Disconnect Voice */}
              <button
                type="button"
                onClick={handleLeaveVoice}
                className="p-1.5 rounded-lg bg-rose-950/70 hover:bg-rose-900 border border-rose-600/40 text-rose-300 hover:text-rose-100 transition-colors cursor-pointer"
                title="Disconnect from Voice Chat"
              >
                <PhoneOff className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Voice Settings Modal */}
      <VoiceSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        voiceState={voiceState}
      />
    </>
  );
};
