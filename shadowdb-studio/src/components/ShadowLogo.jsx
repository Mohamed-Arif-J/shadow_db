import React from 'react';

/**
 * ShadowLogo - Premium, custom isometric database logo for ShadowDB
 * Features vibrant cyan/indigo/purple gradient layers with glowing AI spark
 */
export default function ShadowLogo({ size = 32, className = "", withGlow = true }) {
  const uniqueId = React.useId().replace(/:/g, '');

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}>
      {withGlow && (
        <div
          className="absolute inset-0 rounded-xl bg-gradient-to-tr from-cyan-500/30 via-indigo-500/25 to-purple-500/30 blur-md pointer-events-none -z-10 animate-pulse duration-1000"
          style={{ width: size, height: size }}
        />
      )}
      <svg
        viewBox="0 0 64 64"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm transition-transform duration-200 hover:scale-105">
        <defs>
          <linearGradient id={`bgGrad-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          <linearGradient id={`topPlate-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#00f0ff" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>

          <linearGradient id={`midPlate-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>

          <linearGradient id={`botPlate-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          <linearGradient id={`rimGlow-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#818cf8" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#c084fc" stopOpacity="0.9" />
          </linearGradient>

          <filter id={`shadowGlow-${uniqueId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Squircle Background Container */}
        <rect
          x="2"
          y="2"
          width="60"
          height="60"
          rx="16"
          fill={`url(#bgGrad-${uniqueId})`}
          stroke={`url(#rimGlow-${uniqueId})`}
          strokeWidth="1.5"
        />

        {/* Ambient Database Glow Floor */}
        <ellipse
          cx="32"
          cy="51"
          rx="16"
          ry="4"
          fill="#00f0ff"
          opacity="0.35"
          filter={`url(#shadowGlow-${uniqueId})`}
        />

        {/* DATABASE TIER 3 (BOTTOM DISK) */}
        <path d="M17 38 C17 34 47 34 47 38 L47 43 C47 47 17 47 17 43 Z" fill={`url(#botPlate-${uniqueId})`} opacity="0.95" />
        <ellipse cx="32" cy="38" rx="15" ry="4.5" fill="#1e1b4b" opacity="0.6" />

        {/* DATABASE TIER 2 (MIDDLE DISK) */}
        <path d="M17 27 C17 23 47 23 47 27 L47 32 C47 36 17 36 17 32 Z" fill={`url(#midPlate-${uniqueId})`} />
        <ellipse cx="32" cy="27" rx="15" ry="4.5" fill="#0f172a" opacity="0.5" />

        {/* DATABASE TIER 1 (TOP DISK) */}
        <path d="M17 16 C17 12 47 12 47 16 L47 21 C47 25 17 25 17 21 Z" fill={`url(#topPlate-${uniqueId})`} />
        {/* Top Surface Cap */}
        <ellipse cx="32" cy="16" rx="15" ry="4.8" fill="#e0f2fe" />
        <ellipse cx="32" cy="16" rx="13.5" ry="4" fill={`url(#topPlate-${uniqueId})`} />

        {/* AI Lightning Spark Emblem */}
        <path
          d="M33 13 L27 26 L35 27 L30 40 L38 28 L30 27 Z"
          fill="#ffffff"
          filter={`url(#shadowGlow-${uniqueId})`}
          opacity="0.95"
        />
        <circle cx="33" cy="14" r="1.5" fill="#ffffff" />
        <circle cx="30" cy="40" r="1.2" fill="#00f0ff" />
      </svg>
    </div>
  );
}
