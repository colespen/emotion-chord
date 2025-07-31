import React from 'react';
import Image from 'next/image';
import { CSS_FILTERS, LOGO_SIZES } from '@/lib/constants/ui';

type LogoVariant = 'left' | 'right' | 'full';
type LogoSize = 'xsmall' | 'small' | 'medium' | 'large';

interface BrandLogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  alt?: string;
  className?: string;
}

const LOGO_SOURCES = {
  left: '/musicbrainz-left.svg',
  right: '/musicbrainz-right.svg',
  full: '/musicbrainz.svg',
} as const;

const SIZE_MAP = {
  xsmall: LOGO_SIZES.XSMALL,
  small: LOGO_SIZES.SMALL,
  medium: LOGO_SIZES.MEDIUM,
  large: LOGO_SIZES.LARGE,
} as const;

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'full',
  size = 'small',
  alt,
  className = '',
}) => {
  const dimensions = SIZE_MAP[size];
  const src = LOGO_SOURCES[variant];
  const defaultAlt = alt || `Brand Logo ${variant.charAt(0).toUpperCase() + variant.slice(1)}`;

  return (
    <Image
      src={src}
      alt={defaultAlt}
      width={dimensions.width}
      height={dimensions.height}
      className={className}
      style={{
        filter: CSS_FILTERS.BRAND_COLOR,
      }}
    />
  );
};
