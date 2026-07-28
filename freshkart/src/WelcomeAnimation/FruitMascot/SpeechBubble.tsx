import React from "react";

interface SpeechBubbleProps {
  text: string;
  variant: "greeting" | "goodbye";
}

export default function SpeechBubble({ text, variant }: SpeechBubbleProps) {
  return (
    <div className={`speech-bubble speech-bubble--${variant}`} role="status" aria-live="polite">
      <span>{text}</span>
      <span className="speech-bubble__tail" aria-hidden="true" />
    </div>
  );
}