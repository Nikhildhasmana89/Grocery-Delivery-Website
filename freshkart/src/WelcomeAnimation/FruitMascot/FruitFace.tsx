import React from "react";
import { Mascot } from "./mascots";

interface FruitFaceProps {
  mascot: Mascot;
  isBlinking: boolean;
  /** -1..1 on each axis, from useMousePosition */
  pupilOffset: { x: number; y: number };
  /** true once the character has fully landed and is idling */
  isSmiling: boolean;
}

const PUPIL_RANGE = 4.5;

function BodyShape({ mascot }: { mascot: Mascot }) {
  const { id, palette } = mascot;
  const skinId = `skin-${id}`;
  const fleshId = `flesh-${id}`;

  const gradients = (
    <defs>
      <linearGradient id={skinId} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={palette.skinFrom} />
        <stop offset="100%" stopColor={palette.skinTo} />
      </linearGradient>
      <linearGradient id={fleshId} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={palette.fleshFrom} />
        <stop offset="100%" stopColor={palette.fleshTo} />
      </linearGradient>
    </defs>
  );

  if (id === "banana") {
    return (
      <>
        {gradients}
        <path
          d="M60 20 C40 40, 30 90, 45 140 C58 182, 95 205, 130 195
             C120 190, 100 178, 90 155 C112 165, 138 158, 150 138
             C138 145, 118 142, 105 128 C130 122, 145 98, 138 70
             C132 46, 108 26, 78 22 C72 20, 66 19, 60 20 Z"
          fill={`url(#${skinId})`}
          stroke={palette.accent}
          strokeWidth="4"
          strokeLinejoin="round"
        />
      </>
    );
  }

  if (id === "strawberry") {
    return (
      <>
        {gradients}
        <path
          d="M100 40 C150 40, 178 100, 160 155 C145 200, 118 225, 100 225
             C82 225, 55 200, 40 155 C22 100, 50 40, 100 40 Z"
          fill={`url(#${skinId})`}
          stroke={palette.accent}
          strokeWidth="4"
        />
        {[
          [72, 90], [128, 90], [60, 130], [140, 130], [100, 150], [80, 175], [120, 175],
        ].map(([sx, sy], i) => (
          <ellipse key={i} cx={sx} cy={sy} rx="4" ry="6" fill="#FFE8A3" opacity="0.9" />
        ))}
      </>
    );
  }

  if (id === "apple") {
    return (
      <>
        {gradients}
        <path
          d="M100 55 C145 45, 175 85, 170 130 C165 180, 135 215, 100 215
             C65 215, 35 180, 30 130 C25 85, 55 45, 100 55 Z"
          fill={`url(#${skinId})`}
          stroke={palette.accent}
          strokeWidth="4"
        />
        <path d="M100 130 Q92 145 100 158 Q108 145 100 130" fill={palette.accent} opacity="0.35" />
      </>
    );
  }

  if (id === "mango") {
    return (
      <>
        {gradients}
        <path
          d="M100 40 C150 45, 178 95, 165 145 C152 192, 118 218, 95 216
             C65 214, 32 185, 30 140 C28 95, 58 40, 100 40 Z"
          fill={`url(#${skinId})`}
          stroke={palette.accent}
          strokeWidth="4"
        />
        <path d="M100 40 C120 55, 128 75, 118 95" fill="none" stroke={palette.accent} strokeWidth="3" opacity="0.4" />
      </>
    );
  }

  if (id === "orange") {
    return (
      <>
        {gradients}
        <circle cx="100" cy="130" r="90" fill={`url(#${skinId})`} stroke={palette.accent} strokeWidth="4" />
        {[
          [70, 80], [130, 75], [150, 120], [55, 130], [90, 175], [130, 170], [100, 100],
        ].map(([sx, sy], i) => (
          <circle key={i} cx={sx} cy={sy} r="2.5" fill={palette.accent} opacity="0.3" />
        ))}
      </>
    );
  }

  if (id === "pineapple") {
    return (
      <>
        {gradients}
        <path
          d="M100 55 C145 55, 172 100, 165 145 C158 190, 130 218, 100 218
             C70 218, 42 190, 35 145 C28 100, 55 55, 100 55 Z"
          fill={`url(#${skinId})`}
          stroke={palette.accent}
          strokeWidth="4"
        />
        <path
          d="M50 90 L150 90 M45 120 L155 120 M50 150 L150 150 M75 65 L75 205 M100 60 L100 215 M125 65 L125 205"
          stroke={palette.accent}
          strokeWidth="2.5"
          opacity="0.35"
        />
      </>
    );
  }

  // avocado (default)
  return (
    <>
      {gradients}
      <path
        d="M100 10 C40 10, 18 90, 26 140 C33 190, 62 210, 100 210
           C138 210, 167 190, 174 140 C182 90, 160 10, 100 10 Z"
        fill={`url(#${skinId})`}
        stroke={palette.accent}
        strokeWidth="4"
      />
      <path
        d="M100 24 C52 24, 36 92, 43 138 C49 182, 72 194, 100 194
           C128 194, 151 182, 157 138 C164 92, 148 24, 100 24 Z"
        fill={`url(#${fleshId})`}
      />
    </>
  );
}

function Topper({ mascot }: { mascot: Mascot }) {
  const { id, palette } = mascot;

  if (id === "apple") {
    return (
      <g>
        <rect x="96" y="35" width="8" height="22" rx="3" fill="#6B4226" />
        <path d="M104 42 C120 30, 138 36, 136 50 C124 56, 110 52, 104 42 Z" fill="#4E9F3D" />
      </g>
    );
  }
  if (id === "strawberry" || id === "avocado") {
    return (
      <g>
        <path d="M84 42 C70 24, 96 14, 100 34 C104 14, 130 24, 116 42 C108 50, 92 50, 84 42 Z" fill="#4E9F3D" />
      </g>
    );
  }
  if (id === "pineapple") {
    return (
      <g>
        {[[-14, 0], [-6, -8], [4, -10], [12, -6], [18, 2]].map(([dx, dy], i) => (
          <path
            key={i}
            d={`M100 55 L${100 + dx} ${20 + dy} L${108 + dx} ${20 + dy} Z`}
            fill="#3F7D3A"
          />
        ))}
      </g>
    );
  }
  if (id === "mango") {
    return (
      <g>
        <path d="M96 42 C90 30, 104 24, 106 38" fill="none" stroke={palette.accent} strokeWidth="3" strokeLinecap="round" />
      </g>
    );
  }
  return null;
}

export default function FruitFace({ mascot, isBlinking, pupilOffset, isSmiling }: FruitFaceProps) {
  const px = pupilOffset.x * PUPIL_RANGE;
  const py = pupilOffset.y * PUPIL_RANGE;
  const { palette } = mascot;

  return (
    <svg className="fruit-svg" viewBox="0 0 200 220" width="150" height="165" xmlns="http://www.w3.org/2000/svg">
      <g className="arm-left">
        <path d="M56 128 C20 118, 2 138, -4 164" stroke={palette.accent} strokeWidth="14" strokeLinecap="round" fill="none" />
        <circle cx="-4" cy="164" r="9" fill={palette.accent} />
      </g>
      <g className="arm-right">
        <path d="M144 128 C180 118, 198 138, 204 164" stroke={palette.accent} strokeWidth="14" strokeLinecap="round" fill="none" />
        <circle cx="204" cy="164" r="9" fill={palette.accent} />
      </g>

      <BodyShape mascot={mascot} />
      <Topper mascot={mascot} />

      <g className="face-rig">
        <g className="eyebrows">
          <path d="M68 95 Q78 86 90 92" stroke={palette.accent} strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M132 95 Q122 86 110 92" stroke={palette.accent} strokeWidth="4" strokeLinecap="round" fill="none" />
        </g>

        <g style={{ transform: `translate(${px}px, ${py}px)`, transition: "transform 0.06s linear" }}>
          <g className={isBlinking ? "eye eye-blink" : "eye"}>
            <circle cx="78" cy="112" r="15" fill="#fff" />
            <circle cx="78" cy="113" r="7" fill="#241C10" />
            <circle cx="81" cy="109" r="2.4" fill="#fff" />
          </g>
          <g className={isBlinking ? "eye eye-blink" : "eye"}>
            <circle cx="122" cy="112" r="15" fill="#fff" />
            <circle cx="122" cy="113" r="7" fill="#241C10" />
            <circle cx="125" cy="109" r="2.4" fill="#fff" />
          </g>
        </g>

        <circle cx="66" cy="132" r="7" fill={palette.cheeks} opacity="0.55" />
        <circle cx="134" cy="132" r="7" fill={palette.cheeks} opacity="0.55" />

        <path
          d={isSmiling ? "M82 138 Q100 156 118 138" : "M86 140 Q100 148 114 140"}
          stroke="#3F2B14"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          style={{ transition: "d 0.3s ease" }}
        />
      </g>
    </svg>
  );
}