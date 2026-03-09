import svgPaths from "../../imports/svg-1ld9c2yews";
import { Twitter, Instagram, Facebook } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#0a0b0d] border-t border-[rgba(42,52,50,0.2)] py-16 px-5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="h-[25.735px] w-[79.228px] mb-4">
              <svg className="w-full h-full" fill="none" viewBox="0 0 79.2284 25.7347">
                <g>
                  <path d={svgPaths.p23869b00} fill="white" />
                  <path d={svgPaths.p2cdbe2f0} fill="white" />
                  <path d={svgPaths.p1294a500} fill="white" />
                  <path d={svgPaths.p2ab35100} fill="white" />
                </g>
              </svg>
            </div>
            <p className="text-[#dedede] text-[14px] leading-[1.6] max-w-[300px]">
              AI-powered playlist generation for every mood, moment, and vibe.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-[#f0f1f2] text-[16px] mb-4">Navigation</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#explore"
                  className="text-[#dedede] text-[14px] hover:text-[#4feec5] transition-colors"
                >
                  Explore
                </a>
              </li>
              <li>
                <a
                  href="#playlist"
                  className="text-[#dedede] text-[14px] hover:text-[#4feec5] transition-colors"
                >
                  My Playlist
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  className="text-[#dedede] text-[14px] hover:text-[#4feec5] transition-colors"
                >
                  About Us
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-[#f0f1f2] text-[16px] mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <a
                href="#"
                className="bg-[#15171a] hover:bg-[#4feec5] hover:text-[#0a0b0d] text-[#dedede] w-10 h-10 rounded-full flex items-center justify-center transition-all"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="bg-[#15171a] hover:bg-[#4feec5] hover:text-[#0a0b0d] text-[#dedede] w-10 h-10 rounded-full flex items-center justify-center transition-all"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="bg-[#15171a] hover:bg-[#4feec5] hover:text-[#0a0b0d] text-[#dedede] w-10 h-10 rounded-full flex items-center justify-center transition-all"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-[rgba(42,52,50,0.2)] pt-8">
          <p className="text-[#dedede] text-[12px] text-center">
            © 2026 Jams. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}