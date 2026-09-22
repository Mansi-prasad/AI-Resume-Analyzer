import { motion } from "framer-motion";

const NOISE_DATA_URI =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' seed='3'/></filter><rect width='180' height='180' filter='url(%23n)' opacity='0.9'/></svg>\")";

export function DarkPanel({ className = "", children, glow = true, radius = "rounded-[32px]" }) {
  return (
    <div className={`relative overflow-hidden isolate ${radius} ${className}`}>
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient( 140deg,  #0a615f 0%, #0b5e58 38%, rgb(14, 94, 88) 72%,  #105352 100%)"
}}
      />

      {glow && (
        <>
          <motion.div
            className="absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(168,196,179,0.45) 0%, transparent 70%)",
              filter: "blur(60px)",
            }}            
          />
          <motion.div
            className="absolute -bottom-40 -left-32 w-[460px] h-[460px] rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(232,156,184,0.42) 0%, transparent 70%)",
              filter: "blur(60px)",
            }}            
          />
        </>
      )}

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.05) 50%, transparent 70%)",
          backgroundSize: "200% 200%",
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.06] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: NOISE_DATA_URI }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{ boxShadow: "inset 0 0 120px 20px rgba(0,0,0,0.35)" }}
      />

      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
