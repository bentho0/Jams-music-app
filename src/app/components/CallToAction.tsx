import { useState, useRef } from "react";
import svgPaths from "../../imports/svg-1ld9c2yews";
import { SpotifyConnectModal } from "./SpotifyConnectModal";

export function CallToAction() {
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const handleGeneratePlaylist = () => {
    if (inputValue.trim()) {
      console.log("Generating playlist for:", inputValue);
      setIsModalOpen(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleGeneratePlaylist();
    }
  };

  const handleInputAreaClick = () => {
    inputRef.current?.focus();
  };

  const toggleVoiceRecording = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser. Please try Chrome or Edge.');
      return;
    }

    if (isRecording) {
      // Stop recording
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    } else {
      // Request microphone permission first
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          // Start recording
          const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
          const recognition = new SpeechRecognition();
          
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';

          recognition.onstart = () => {
            setIsRecording(true);
          };

          recognition.onresult = (event: any) => {
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
              const transcript = event.results[i][0].transcript;
              if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
              }
            }

            if (finalTranscript) {
              setInputValue((prev) => {
                const baseText = prev ? prev + ' ' : '';
                return (baseText + finalTranscript).trim();
              });
            }
          };

          recognition.onerror = (event: any) => {
            setIsRecording(false);
            
            if (event.error === 'not-allowed') {
              // Silently handle - permission already denied at getUserMedia level
              return;
            } else if (event.error === 'no-speech') {
              // Silently handle no speech - user may not have spoken yet
              return;
            } else if (event.error === 'aborted') {
              // Silently handle abort - user stopped recording
              return;
            }
            // Only log unexpected errors
            console.warn('Speech recognition issue:', event.error);
          };

          recognition.onend = () => {
            setIsRecording(false);
          };

          recognitionRef.current = recognition;
          recognition.start();
        })
        .catch((error) => {
          // Handle microphone permission denial gracefully
          setIsRecording(false);
          
          if (error.name === 'NotAllowedError') {
            alert('🎤 Microphone access is required for voice input.\n\nPlease click the camera/microphone icon in your browser\'s address bar and allow microphone access, then try again.');
          } else if (error.name === 'NotFoundError') {
            alert('No microphone found. Please connect a microphone and try again.');
          } else {
            alert('Unable to access microphone. Please check your browser settings and try again.');
          }
        });
    }
  };

  return (
    <section className="bg-[#0f1012] py-16 md:py-32 px-5 relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[800px] h-[400px] bg-[#4feec5] opacity-10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center space-y-8">
          <h2 className="text-[#f0f1f2] text-[32px] md:text-[56px] leading-[1.2] tracking-[-0.56px]">
            Ready to create your perfect playlist?
          </h2>

          {/* Input Field */}
          <div className="w-full max-w-[704px] mx-auto">
            <div className="bg-[#15171a] rounded-[20px] border border-[rgba(42,52,50,0.2)] p-5 hover:border-[#4feec5] transition-colors cursor-text" onClick={handleInputAreaClick}>
              <div className="relative mb-3">
                {!inputValue && (
                  <p className="text-[#b4b4b4] text-[15px] absolute top-0 left-0 pointer-events-none">
                    Type your request
                  </p>
                )}
                <input
                  id="cta-prompt-input"
                  name="prompt"
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full bg-transparent text-[#f0f1f2] text-[15px] outline-none placeholder:text-[#6b6b6b]"
                  ref={inputRef}
                />
              </div>
              <div className="flex items-center justify-end gap-5">
                <button
                  onClick={toggleVoiceRecording}
                  className={`${
                    isRecording 
                      ? 'bg-[#4feec5] animate-pulse' 
                      : 'bg-[#2a2e34] hover:bg-[#3a3e44]'
                  } transition-colors rounded-full p-2`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 12.0004 13.8441">
                    <path d={svgPaths.p2cbffe80} fill={isRecording ? '#0a0b0d' : '#A4ABB4'} />
                    <path d={svgPaths.p14f06280} fill={isRecording ? '#0a0b0d' : '#A4ABB4'} />
                    <path d={svgPaths.p4247e00} fill={isRecording ? '#0a0b0d' : '#A4ABB4'} />
                    <path d={svgPaths.pc2370b0} fill={isRecording ? '#0a0b0d' : '#A4ABB4'} />
                  </svg>
                </button>
                <button
                  onClick={handleGeneratePlaylist}
                  className="bg-[#4feec5] hover:bg-[#3fd9b5] transition-all px-8 py-4 rounded-lg text-[#0a0b0d] text-[16px] shadow-[0_0_30px_rgba(79,238,197,0.4)] hover:shadow-[0_0_50px_rgba(79,238,197,0.6)] transform hover:scale-105"
                >
                  Generate Playlist
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spotify Connect Modal */}
      <SpotifyConnectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        playlistName={inputValue}
        isPlaylistGeneration={true}
      />
    </section>
  );
}