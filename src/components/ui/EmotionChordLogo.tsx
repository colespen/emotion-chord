import React from "react";
import Image from "next/image";
import { CSS_FILTERS } from "@/lib/constants/ui";

interface EmotionChordLogoProps {
  className?: string;
  size?: number;
}

export const EmotionChordLogo: React.FC<EmotionChordLogoProps> = ({
  className = "",
  size = 32,
}) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Image
        src="/musicbrainz.svg"
        alt="Emotion Chord Logo"
        width={size}
        height={size}
        className="object-contain"
        style={{
          filter: CSS_FILTERS.BRAND_COLOR,
        }}
        priority
      />
    </div>
  );
};
