import { motion } from "framer-motion";
import { PiStarFourFill } from "react-icons/pi";

const AILogo = () => {
  return (
    <div className="relative h-12 w-12 flex items-center justify-center">
      {/* Glow */}
      <motion.div
        className="absolute h-8 w-8 rounded-full"
        style={{
          background: "#8F3F59",
          filter: "blur(10px)",
        }}
        animate={{ opacity: [0.2, 0.45, 0.2] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      />

      {/* Logo shape */}
      <div
        className="relative h-9 w-9 rounded-[11px] flex items-center justify-center"
        style={{
          background: "linear-gradient(145deg, #A65370, #6F2942)",
          boxShadow: "0 5px 12px rgba(143,63,89,0.3)",
        }}
      >
        {/* Stylized R */}
        <span
          className="relative text-[22px] font-bold leading-none text-white"
          style={{ fontFamily: "Arial, sans-serif" }}
        >
          R
          {/* Scan line */}
          <motion.span
            className="absolute left-0 right-0 h-[2px] rounded-full"
            style={{
              background: "#F3DDE4",
              boxShadow: "0 0 5px rgba(255,255,255,0.9)",
            }}
            animate={{
              top: ["5%", "95%", "5%"],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </span>

        {/* AI sparkle */}
        <motion.span
          className="absolute -right-1 -top-1 text-[11px] text-white"
          animate={{
            opacity: [0.4, 1, 0.4],
            scale: [0.8, 1.15, 0.8],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
          }}
        >
          <PiStarFourFill />
        </motion.span>
      </div>
    </div>
  );
};

export default AILogo;