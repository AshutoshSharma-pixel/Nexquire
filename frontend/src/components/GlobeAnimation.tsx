"use client"

import React from "react"
import { motion } from "framer-motion"

const GlobeAnimation = () => {
  return (
    <div className="relative w-[500px] h-[500px]">
      <svg viewBox="0 0 500 500" width="500" height="500" className="drop-shadow-2xl">
        <defs>
          <radialGradient id="bwGlobe" cx="38%" cy="32%" r="65%">
            <stop offset="0%" stopColor="#F8F8F8" />
            <stop offset="50%" stopColor="#EAEAEA" />
            <stop offset="100%" stopColor="#D0D0D0" />
          </radialGradient>
          
          <radialGradient id="bwShine" cx="30%" cy="25%" r="45%">
            <stop offset="0%" stopColor="white" stopOpacity="0.8" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          
          <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="8" stdDeviation="20" floodColor="#000" floodOpacity="0.1" />
          </filter>
          
          <clipPath id="globeClip">
            <circle cx="250" cy="250" r="200" />
          </clipPath>
        </defs>

        {/* Shadow Under Globe */}
        <ellipse cx="250" cy="460" rx="160" ry="20" fill="#000" fillOpacity="0.05" />

        {/* Main Globe Body */}
        <circle cx="250" cy="250" r="200" fill="url(#bwGlobe)" filter="url(#softShadow)" />

        <g clipPath="url(#globeClip)">
          {/* Continent Blobs */}
          <g fill="#000" fillOpacity="0.08">
            <ellipse cx="192" cy="210" rx="52" ry="38" />
            <ellipse cx="300" cy="192" rx="60" ry="42" />
            <ellipse cx="328" cy="268" rx="38" ry="48" />
            <ellipse cx="183" cy="298" rx="28" ry="22" />
            <ellipse cx="252" cy="335" rx="48" ry="28" />
            <ellipse cx="148" cy="252" rx="18" ry="32" />
          </g>

          {/* Grid Lines */}
          <g stroke="#000" strokeWidth="0.5" strokeOpacity="0.1" fill="none">
            {/* Latitudes */}
            <ellipse cx="250" cy="250" rx="200" ry="50" />
            <ellipse cx="250" cy="175" rx="167" ry="42" />
            <ellipse cx="250" cy="325" rx="167" ry="42" />
            <ellipse cx="250" cy="115" rx="115" ry="29" />
            <ellipse cx="250" cy="385" rx="115" ry="29" />
            
            {/* Longitudes */}
            <path d="M 250 50 Q 250 250 250 450" />
            <path d="M 148 78 Q 250 250 352 422" />
            <path d="M 352 78 Q 250 250 148 422" />
            <path d="M 83 150 Q 250 250 417 350" />
            <path d="M 417 150 Q 250 250 83 350" />
          </g>

          {/* Connection Lines */}
          <g stroke="#000" strokeWidth="0.8" strokeOpacity="0.2" fill="none">
            <path d="M 192 210 L 300 192 L 328 268 L 252 335 L 183 298 L 148 252 Z" />
            <path d="M 192 210 L 328 268 M 300 192 L 252 335 M 328 268 L 183 298" />
          </g>

          {/* Node Dots & Pulse Rings */}
          {[
            { x: 192, y: 210, pulse: false },
            { x: 300, y: 192, pulse: true, delay: 0 },
            { x: 328, y: 268, pulse: false },
            { x: 183, y: 298, pulse: true, delay: 1 },
            { x: 252, y: 335, pulse: true, delay: 0.5 },
            { x: 148, y: 252, pulse: false }
          ].map((node, i) => (
            <g key={i}>
              <circle cx={node.x} cy={node.y} r="4" fill="#000" fillOpacity="0.6" />
              {node.pulse && (
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r="4"
                  stroke="#000"
                  strokeWidth="1"
                  fill="none"
                  initial={{ r: 4, opacity: 0.5 }}
                  animate={{ r: 18, opacity: 0 }}
                  transition={{ duration: 3, repeat: Infinity, delay: node.delay, ease: "easeOut" }}
                />
              )}
            </g>
          ))}
        </g>

        {/* Shine Overlay */}
        <circle cx="250" cy="250" r="200" fill="url(#bwShine)" style={{ pointerEvents: 'none' }} />

        {/* Outer Rings */}
        <circle cx="250" cy="250" r="218" stroke="#E0E0E0" strokeWidth="0.5" fill="none" opacity="0.6" />
        <circle cx="250" cy="250" r="238" stroke="#F0F0F0" strokeWidth="0.5" fill="none" opacity="0.4" />

        {/* Rotating Orbit & Satellite */}
        <g transform="rotate(-20 250 250)">
          <ellipse 
            cx="250" cy="250" rx="240" ry="60" 
            stroke="#999" strokeWidth="0.8" strokeDasharray="4 6" 
            fill="none" opacity="0.3"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 250 250"
              to="360 250 250"
              dur="20s"
              repeatCount="indefinite"
            />
          </ellipse>
          
          <motion.circle 
            r="4" fill="#000" fillOpacity="0.6"
            animate={{
              offsetDistance: ["0%", "100%"]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            style={{ 
              motionPath: 'ellipse(240px 60px at 250px 250px)'
            }}
          />
        </g>
      </svg>
    </div>
  )
}

export default GlobeAnimation
