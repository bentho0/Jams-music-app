import { motion } from "motion/react";
import { Play } from "lucide-react";

const playlists = [
  {
    title: "Late Night Drive",
    creator: "Sarah Chen",
    image: "https://images.unsplash.com/photo-1679563813909-ead33a63b1d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaWdodCUyMGNpdHklMjBkcml2ZSUyMG5lb258ZW58MXx8fHwxNzcyMDczODY2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    title: "Morning Energy Boost",
    creator: "Mike Johnson",
    image: "https://images.unsplash.com/photo-1618020397590-abb8a238853f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3JuaW5nJTIwc3VucmlzZSUyMGVuZXJneXxlbnwxfHx8fDE3NzIwNzM4Njd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    title: "Rainy Day Feels",
    creator: "Emma Wilson",
    image: "https://images.unsplash.com/photo-1626710733869-0ad663e742fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYWlueSUyMHdpbmRvdyUyMGRyb3BzfGVufDF8fHx8MTc3MjA3Mzg2N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    title: "Gym Motivation",
    creator: "Alex Martinez",
    image: "https://images.unsplash.com/photo-1584827386916-b5351d3ba34b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxneW0lMjB3b3Jrb3V0JTIwZml0bmVzc3xlbnwxfHx8fDE3NzIwMTA4NTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    title: "Focus & Flow",
    creator: "Jordan Lee",
    image: "https://images.unsplash.com/photo-1654701502337-7d69f18d19e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkeSUyMGRlc2slMjBoZWFkcGhvbmVzfGVufDF8fHx8MTc3MjA3Mzg2OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    title: "Sunday Brunch Vibes",
    creator: "Taylor Brooks",
    image: "https://images.unsplash.com/photo-1549416878-bc84813b7e32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicnVuY2glMjBjb2ZmZWUlMjB0YWJsZXxlbnwxfHx8fDE3NzIwNzM4Njh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
];

// Generate initials from creator name for avatar
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("");
};

export function ExamplePlaylists() {
  const handlePlayClick = (e: React.MouseEvent, playlistTitle: string) => {
    e.stopPropagation();
    console.log(`Playing playlist: ${playlistTitle}`);
    // Add play functionality here
  };

  const handleCardClick = (playlistTitle: string) => {
    console.log(`Opening playlist: ${playlistTitle}`);
    // Add open playlist functionality here
  };

  return (
    <section className="py-16 md:py-24 px-5 bg-[#0a0b0d]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-[#f0f1f2] text-[32px] md:text-[48px] leading-[1.2] tracking-[-0.48px] mb-4">
            See What Jams Can Create
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              className="group relative cursor-pointer"
              onClick={() => handleCardClick(playlist.title)}
            >
              {/* Playlist Cover */}
              <div className="h-80 relative rounded-[16px] mb-4 overflow-hidden">
                <img 
                  src={playlist.image} 
                  alt={playlist.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black opacity-20 group-hover:opacity-10 transition-opacity" />
                
                {/* Play Button - Bottom Right */}
                <button
                  className="absolute bottom-3 right-3 bg-[#4feec5] rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg hover:scale-110"
                  onClick={(e) => handlePlayClick(e, playlist.title)}
                >
                  <Play className="w-6 h-6 text-[#0a0b0d] fill-[#0a0b0d]" />
                </button>
              </div>

              {/* Playlist Info */}
              <div className="space-y-2">
                <h3 className="text-[#f0f1f2] text-[18px]">
                  {playlist.title}
                </h3>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#4feec5] to-[#3fd9b5] flex items-center justify-center text-[#0a0b0d] text-[10px] font-medium">
                    {getInitials(playlist.creator)}
                  </div>
                  <span className="text-[#b4b4b4] text-[14px]">
                    {playlist.creator}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}