import { motion } from "motion/react";
import { MessageSquare, Sparkles, Share2 } from "lucide-react";

const steps = [
  {
    icon: MessageSquare,
    title: "Tell us the vibe",
    description: "Type your mood, moment, or activity.",
  },
  {
    icon: Sparkles,
    title: "AI curates your playlist",
    description: "Our AI analyzes your request and finds matching songs.",
  },
  {
    icon: Share2,
    title: "Save & share",
    description: "Connect Spotify and instantly save your playlist.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-[#0a0b0d] py-16 md:py-24 px-5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-[#f0f1f2] text-[32px] md:text-[48px] leading-[1.2] tracking-[-0.48px] mb-4">
            How Jams Works
          </h2>
          <p className="text-[#dedede] text-[18px]">
            Create personalized playlists in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="bg-[#15171a] border border-[rgba(42,52,50,0.2)] rounded-[24px] p-8 hover:border-[#4feec5] hover:shadow-[0_0_30px_rgba(79,238,197,0.2)] transition-all"
            >
              <div className="bg-[#4feec5] bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <step.icon className="w-8 h-8 text-[#4feec5]" />
              </div>
              <h3 className="text-[#f0f1f2] text-[24px] mb-3">{step.title}</h3>
              <p className="text-[#dedede] text-[16px] leading-[1.5]">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}