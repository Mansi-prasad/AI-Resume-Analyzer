import { motion } from "framer-motion";
import {
  TrendingUp,
} from "lucide-react";

const RADIUS = 78;
const ARC = Math.PI * RADIUS;
const SCORE = 86;
const PCT = SCORE / 100;

// Floating, layered mockups that compose a "live" product preview inside the dark hero card.
export function HeroDashboardPreview() {
  return (
    <div className="relative w-full h-[260px] sm:h-[320px]">
      {/* Main gauge card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        className="absolute top-6 left-1/2 -translate-x-1/2 w-[280px] sm:w-[300px] rounded-[22px] border border-white/[0.08] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.6)] p-5 overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg, #1F2A24 0%, #16181D 45%, #0F1115 100%)",
          boxShadow:
            "0 24px 60px -12px rgba(0,0,0,0.6), inset 0 1px 0 0 rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.16em] text-white/45 font-semibold">
              ATS Readiness
            </div>
            <div className="text-[11px] text-white/55 mt-0.5">Senior_Frontend.pdf</div>
          </div>
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[rgba(143,179,156,0.14)] text-[#8FB39C] text-[10px] font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-[#8FB39C]" />
            Strong
          </div>
        </div>

        <div className="relative mx-auto w-[200px]">
          <svg viewBox="0 0 200 120" className="w-full h-auto block">
            <defs>
              <linearGradient id="heroArc" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8FB39C" />
                <stop offset="100%" stopColor="#B6CFC0" />
              </linearGradient>
            </defs>
            <path
              d={`M 22 105 A ${RADIUS} ${RADIUS} 0 0 1 178 105`}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <motion.path
              d={`M 22 105 A ${RADIUS} ${RADIUS} 0 0 1 178 105`}
              fill="none"
              stroke="url(#heroArc)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={ARC}
              initial={{ strokeDashoffset: ARC }}
              animate={{ strokeDashoffset: ARC - ARC * PCT }}
              transition={{ duration: 1.4, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>
          <div className="absolute inset-x-0 top-[48%] flex flex-col items-center">
            <div className="font-display tabular text-[42px] font-semibold tracking-tight text-white leading-none">
              {SCORE}
            </div>
            <div className="text-[10px] text-white/45 mt-0.5">out of 100</div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-center">
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[rgba(143,179,156,0.16)] text-[#B6CFC0] text-[10px] font-semibold tabular">
            <TrendingUp size={10} strokeWidth={2.5} />
            +18 vs V1
          </div>
        </div>
      </motion.div>
    </div>
  );
}
