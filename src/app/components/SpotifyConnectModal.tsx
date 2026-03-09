import { useState } from "react";
import svgPaths from "../../imports/svg-1g33f6c7um";
import { initiateSpotifyAuth } from "../utils/spotifyAuth";

interface SpotifyConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlistName?: string;
  isPlaylistGeneration?: boolean;
}

export function SpotifyConnectModal({ isOpen, onClose, playlistName, isPlaylistGeneration = false }: SpotifyConnectModalProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConnectSpotify = async () => {
    console.log('=== SPOTIFY CONNECT BUTTON CLICKED ===');
    console.log('isPlaylistGeneration:', isPlaylistGeneration);
    console.log('playlistName (prompt):', playlistName);
    setIsConnecting(true);
    setError(null);
    
    try {
      // Store the playlist name in sessionStorage if this is a playlist generation flow
      if (isPlaylistGeneration && playlistName) {
        console.log('Storing prompt in sessionStorage:', playlistName);
        sessionStorage.setItem('spotify_playlist_prompt', playlistName);
      } else {
        console.log('NOT storing prompt. isPlaylistGeneration:', isPlaylistGeneration, 'playlistName:', playlistName);
      }
      
      console.log('About to call initiateSpotifyAuth...');
      await initiateSpotifyAuth(isPlaylistGeneration);
      console.log('initiateSpotifyAuth completed (should not see this if redirect works)');
      // User will be redirected to Spotify, so we won't reach here
    } catch (err) {
      console.error('=== SPOTIFY CONNECT ERROR ===');
      console.error('Error object:', err);
      console.error('Error message:', err instanceof Error ? err.message : 'Unknown error');
      setError(err instanceof Error ? err.message : 'Failed to connect to Spotify');
      setIsConnecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative z-10 w-[470px] mx-4">
        <div className="bg-[#15171a] rounded-[12px] border-[0.5px] border-[rgba(44,44,44,0.3)]">
          <div className="flex flex-col gap-[44px] items-center px-[54px] pt-[32px] pb-[40px]">
            {/* Header Section */}
            <div className="flex flex-col gap-[40px] items-start w-full">
              {/* Title and Description */}
              <div className="flex flex-col gap-[8px] items-start">
                <h2 className="text-white text-[24px] leading-[1.2] tracking-[-0.24px]">
                  Connect your Spotify account
                </h2>
                <p className="text-[#dedede] text-[14px] leading-[1.5] w-full whitespace-pre-wrap">
                  To create playlists you'll actually love, we need access to your Spotify music library and listening preferences.
                </p>
              </div>

              {/* What we'll access */}
              <div className="flex flex-col gap-[8px] items-start w-full">
                <h3 className="text-white text-[18px] leading-[1.2] tracking-[-0.18px]">
                  What we'll access
                </h3>
                <ul className="text-[#dedede] text-[14px] list-disc pl-[21px] space-y-0">
                  <li className="leading-[1.8]">Your saved tracks and playlists</li>
                  <li className="leading-[1.8]">Your listening preferences</li>
                  <li className="leading-[1.8]">Basic profile info (name & avatar)</li>
                </ul>
              </div>
            </div>

            {/* Action Section */}
            <div className="flex flex-col gap-[8px] items-center w-full">
              <button
                onClick={handleConnectSpotify}
                disabled={isConnecting}
                className="bg-[#4feec5] hover:bg-[#3fd9b5] disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-[8px] w-full px-[20px] py-[12px] flex items-center justify-center gap-[8px]"
              >
                {/* Spotify Icon */}
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
                  <path d={svgPaths.p36181f00} fill="#0A0B0D" />
                </svg>
                <span className="text-[#0a0b0d] text-[14px] tracking-[-0.14px] font-semibold leading-[1.3]">
                  {isConnecting ? 'Redirecting...' : 'Connect your spotify'}
                </span>
              </button>
              {error && (
                <p className="text-red-400 text-[12px] text-center leading-[1.3] bg-red-900/20 px-3 py-2 rounded">
                  {error}
                </p>
              )}
              <p className="text-[#dedede] text-[12px] text-center leading-[1.3]">
                You stay in control. You can disconnect anytime from settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}