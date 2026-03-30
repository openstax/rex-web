import React from 'react';
import styled from 'styled-components/macro';

interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  className?: string;
}

/**
 * TimesIcon component - Font Awesome "times" / "close" icon for content components.
 * SVG path from Font Awesome Free (https://fontawesome.com - MIT License)
 *
 * Usage: Use this Font Awesome-based icon in content components that were migrated from styled-icons.
 * For UI close buttons (modals, toasts, sidebars), use the existing components/Times.tsx instead.
 *
 * Note: Wrapped with styled() to enable styled-components component selector references
 */
function TimesIconBase({ className, ...props }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 352 512"
      aria-hidden="true"
      {...props}
    >
      <path
        fill="currentColor"
        d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"
      />
    </svg>
  );
}

export const TimesIcon = styled(TimesIconBase)``;

export default TimesIcon;
