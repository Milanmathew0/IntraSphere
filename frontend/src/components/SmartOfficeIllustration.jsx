import { Box } from "@mui/material";

export function SmartOfficeIllustration() {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 520,
        height: "auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        my: 2,
        position: "relative",
        filter: "drop-shadow(0px 20px 30px rgba(0, 0, 0, 0.25))",
        "& .floating-element": {
          animation: "float 6s ease-in-out infinite",
        },
        "& .floating-element-reverse": {
          animation: "floatReverse 7s ease-in-out infinite",
        },
        "& .pulse-glow": {
          animation: "pulseGlow 3s infinite alternate",
        },
        "@keyframes float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "@keyframes floatReverse": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(10px)" },
        },
        "@keyframes pulseGlow": {
          "0%": { opacity: 0.6 },
          "100%": { opacity: 1 },
        },
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 560 420"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="bgGlow" x1="280" y1="50" x2="280" y2="380" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00ACC1" stopOpacity="0.25" />
            <stop offset="1" stopColor="#1976D2" stopOpacity="0.05" />
          </linearGradient>

          <linearGradient id="cardGrad1" x1="0" y1="0" x2="200" y2="140" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1E293B" stopOpacity="0.85" />
            <stop offset="1" stopColor="#0F172A" stopOpacity="0.95" />
          </linearGradient>

          <linearGradient id="primaryAccent" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#1976D2" />
            <stop offset="1" stopColor="#00ACC1" />
          </linearGradient>

          <linearGradient id="greenAccent" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#2E7D32" />
            <stop offset="1" stopColor="#4CAF50" />
          </linearGradient>
        </defs>

        {/* Ambient Glow */}
        <circle cx="280" cy="210" r="180" fill="url(#bgGlow)" className="pulse-glow" />

        {/* Isometric Office Floor Grid Lines */}
        <path d="M120 280 L280 360 L440 280 L280 200 Z" fill="rgba(255, 255, 255, 0.03)" stroke="rgba(0, 172, 193, 0.2)" strokeWidth="1.5" strokeDasharray="4 4" />
        <path d="M160 260 L280 320 L400 260" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" />
        <path d="M200 240 L280 280 L360 240" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" />

        {/* Central Smart Building / Work Hub */}
        <g className="floating-element">
          {/* Main Tower Base */}
          <path d="M220 220 L280 190 L340 220 L340 310 L280 340 L220 310 Z" fill="url(#cardGrad1)" stroke="rgba(0, 172, 193, 0.5)" strokeWidth="2" />
          <path d="M280 190 L280 340" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1.5" />
          
          {/* Illuminated Office Floors */}
          <path d="M230 240 L280 215 L330 240" stroke="#00ACC1" strokeWidth="2" strokeOpacity="0.8" />
          <path d="M230 265 L280 240 L330 265" stroke="#1976D2" strokeWidth="2" strokeOpacity="0.8" />
          <path d="M230 290 L280 265 L330 290" stroke="#4CAF50" strokeWidth="2" strokeOpacity="0.8" />

          {/* AI Cloud Hub Beacon Icon */}
          <circle cx="280" cy="190" r="16" fill="url(#primaryAccent)" />
          <circle cx="280" cy="190" r="26" stroke="#00ACC1" strokeWidth="1.5" strokeDasharray="3 3" className="pulse-glow" />
          <path d="M273 190 L278 185 L287 194" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Floating Card 1: Workspace Occupancy */}
        <g className="floating-element-reverse">
          <rect x="60" y="80" width="170" height="95" rx="14" fill="#1E293B" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1.5" />
          <circle cx="90" cy="112" r="14" fill="rgba(25, 118, 210, 0.2)" />
          <path d="M85 112 L89 116 L96 108" stroke="#42A5F5" strokeWidth="2" strokeLinecap="round" />
          <text x="114" y="110" fill="#FFFFFF" fontSize="13" fontWeight="bold" fontFamily="Roboto">Desk Booking</text>
          <text x="114" y="126" fill="#00ACC1" fontSize="11" fontFamily="Roboto">94% Occupancy</text>
          
          {/* Mini Progress Bar */}
          <rect x="85" y="142" width="120" height="6" rx="3" fill="rgba(255, 255, 255, 0.1)" />
          <rect x="85" y="142" width="102" height="6" rx="3" fill="url(#primaryAccent)" />
        </g>

        {/* Floating Card 2: AI Meeting Optimizer */}
        <g className="floating-element">
          <rect x="330" y="90" width="175" height="100" rx="14" fill="#1E293B" stroke="rgba(0, 172, 193, 0.3)" strokeWidth="1.5" />
          <rect x="345" y="108" width="28" height="28" rx="8" fill="url(#primaryAccent)" />
          <path d="M353 122 L365 122 M359 116 L359 128" stroke="white" strokeWidth="2" strokeLinecap="round" />
          
          <text x="383" y="120" fill="#FFFFFF" fontSize="13" fontWeight="bold" fontFamily="Roboto">Smart Rooms</text>
          <text x="383" y="136" fill="#94A3B8" fontSize="11" fontFamily="Roboto">AI Sync Active</text>

          <rect x="345" y="152" width="60" height="22" rx="11" fill="rgba(46, 125, 50, 0.2)" />
          <text x="357" y="167" fill="#4CAF50" fontSize="10" fontWeight="bold" fontFamily="Roboto">Ready</text>
        </g>

        {/* Floating Card 3: Employee Security & Cloud Node */}
        <g className="floating-element-reverse">
          <rect x="340" y="270" width="160" height="85" rx="14" fill="#1E293B" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1.5" />
          <circle cx="368" cy="300" r="14" fill="rgba(0, 172, 193, 0.2)" />
          <path d="M363 300 L373 300 M368 295 L368 305" stroke="#00ACC1" strokeWidth="2" />
          <text x="390" y="298" fill="#FFFFFF" fontSize="12" fontWeight="bold" fontFamily="Roboto">Enterprise SSO</text>
          <text x="390" y="314" fill="#94A3B8" fontSize="10" fontFamily="Roboto">Protected 256-bit</text>
          <rect x="360" y="328" width="120" height="12" rx="4" fill="rgba(255, 255, 255, 0.06)" />
        </g>

        {/* Network Connection Rays */}
        <line x1="145" y1="175" x2="280" y2="190" stroke="#00ACC1" strokeWidth="1.5" strokeDasharray="3 3" strokeOpacity="0.6" />
        <line x1="417" y1="190" x2="280" y2="190" stroke="#1976D2" strokeWidth="1.5" strokeDasharray="3 3" strokeOpacity="0.6" />
        <line x1="420" y1="270" x2="280" y2="190" stroke="#4CAF50" strokeWidth="1.5" strokeDasharray="3 3" strokeOpacity="0.6" />
      </svg>
    </Box>
  );
}
