import { motion } from "motion/react";
import { Brain, Zap, Music2, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-powered personalization",
    description:
      "Our advanced AI understands your mood and musical preferences to create the perfect playlist every time.",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop",
  },
  {
    icon: Zap,
    title: "Instant playlist generation",
    description:
      "No more spending hours searching for songs. Get a complete curated playlist in seconds.",
    image: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=600&h=400&fit=crop",
  },
  {
    icon: Music2,
    title: "Works with Spotify",
    description:
      "Seamlessly connect your Spotify account to save and enjoy your AI-generated playlists instantly.",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=400&fit=crop",
  },
  {
    icon: TrendingUp,
    title: "Discover new music effortlessly",
    description:
      "Explore artists and genres you've never heard before, perfectly matched to your taste.",
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&h=400&fit=crop",
  },
];

export function WhyChooseJams() {
  return (
    <section className="bg-[#0a0b0d] py-16 md:py-24 px-5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-[#f0f1f2] text-[32px] md:text-[48px] leading-[1.2] tracking-[-0.48px] mb-4">
            Built for Every Mood
          </h2>
        </div>

        <div className="space-y-16 md:space-y-32">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className={`flex flex-col ${
                index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              } gap-8 md:gap-12 items-center`}
            >
              {/* Image */}
              <div className="flex-1 w-full">
                <div className="relative rounded-[24px] overflow-hidden group">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-[220px] md:h-[400px] object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b0d] to-transparent opacity-40" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 space-y-6">
                <div className="bg-[#4feec5] bg-opacity-10 w-16 md:w-20 h-16 md:h-20 rounded-full flex items-center justify-center">
                  <feature.icon className="w-8 md:w-10 h-8 md:h-10 text-[#4feec5]" />
                </div>
                <h3 className="text-[#f0f1f2] text-[26px] md:text-[36px] leading-[1.2] tracking-[-0.36px]">
                  {feature.title}
                </h3>
                <p className="text-[#dedede] text-[16px] md:text-[18px] leading-[1.6]">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}