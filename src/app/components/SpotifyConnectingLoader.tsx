import svgPaths from "../../imports/svg-qalc8lurnt";

interface SpotifyConnectingLoaderProps {
  isVisible: boolean;
  isConnected?: boolean;
}

export function SpotifyConnectingLoader({ isVisible, isConnected = false }: SpotifyConnectingLoaderProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gradient-to-t from-[#15171a] from-[0.331%] to-[#113f33] to-[174.17%] rounded-[12px] p-8 relative w-[400px]">
        <div className="flex flex-col gap-[20px] items-center">
          {/* Spotify Icon */}
          <div className="relative shrink-0 size-[44px]">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 44 44">
              <g>
                <path d={svgPaths.p1ec93e00} fill="#22CC00" />
              </g>
            </svg>
          </div>

          {/* Text with animated dots */}
          <div className="flex flex-col gap-[8px] items-center justify-center">
            <p className="font-['Host_Grotesk',sans-serif] font-semibold leading-[1.2] text-[24px] text-center text-white tracking-[-0.24px]">
              {isConnected ? (
                "Spotify Connected"
              ) : (
                <>
                  Connecting Spotify
                  <span className="inline-flex ml-0.5">
                    <span className="animate-dot-1">.</span>
                    <span className="animate-dot-2">.</span>
                    <span className="animate-dot-3">.</span>
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
        
        {/* Border overlay */}
        <div 
          aria-hidden="true" 
          className="absolute border-[0.5px] border-[rgba(44,44,44,0.3)] border-solid inset-[-0.25px] pointer-events-none rounded-[12.25px]" 
        />

        <style>{`
          @keyframes dot-fade {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 1; }
          }
          
          .animate-dot-1 {
            animation: dot-fade 1.4s ease-in-out infinite;
          }
          
          .animate-dot-2 {
            animation: dot-fade 1.4s ease-in-out 0.2s infinite;
          }
          
          .animate-dot-3 {
            animation: dot-fade 1.4s ease-in-out 0.4s infinite;
          }
        `}</style>
      </div>
    </div>
  );
}