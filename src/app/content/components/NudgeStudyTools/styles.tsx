import React from 'react';
import classNames from 'classnames';
import { PlainButton } from '../../../components/Button';
import htmlMessage from '../../../components/htmlMessage';
import { TimesIcon } from '../../../components/icons/Times';
import theme from '../../../theme';
import './NudgeStudyTools.css';

// theme.zIndex.nudgeOverlay drives both the background and the +1 layer above
// it; exposed as a custom property so NudgeStudyTools.css stays in sync with
// the theme rather than hardcoding the number.
const overlayZIndex = {
  '--nudge-overlay-z-index': theme.zIndex.nudgeOverlay,
} as React.CSSProperties;

interface Placement {
  top: number;
  left: number;
}

const placementStyle = ({ top, left }: Placement, rest?: React.CSSProperties): React.CSSProperties => ({
  ...overlayZIndex,
  top: `${top}px`,
  left: `${left}px`,
  ...rest,
});

export const NudgeWrapper = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={classNames('nudge-wrapper', className)} {...props} />
);

export const NudgeElementTarget = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={classNames('nudge-wrapper', className)} {...props} />
);

type NudgeContentWrapperProps = React.HTMLAttributes<HTMLDivElement> & Placement;

export const NudgeContentWrapper = React.forwardRef<HTMLDivElement, NudgeContentWrapperProps>(
  function NudgeContentWrapper({ className, style, top, left, ...props }, ref) {
    return <div
      ref={ref}
      className={classNames('nudge-content-wrapper', className)}
      style={placementStyle({ top, left }, style)}
      {...props}
    />;
  }
);

export const NudgeContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={classNames('nudge-content', className)} {...props} />
);

const NudgeHeadingStyles = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  // content arrives via dangerouslySetInnerHTML from htmlMessage(), which the rule can't see
  // eslint-disable-next-line jsx-a11y/heading-has-content
  <h2 className={classNames('nudge-heading', className)} {...props} />
);

export const NudgeHeading = htmlMessage('i18n:nudge:study-tools:heading', NudgeHeadingStyles);

export const NudgeTextStyles = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={classNames('nudge-text', className)} {...props} />
);

type NudgeArrowProps = React.ImgHTMLAttributes<HTMLImageElement> & Placement;

export const NudgeArrow = ({ className, style, top, left, ...props }: NudgeArrowProps) => (
  // alt is supplied by the caller through ...props; the arrow is decorative (alt='')
  // eslint-disable-next-line jsx-a11y/alt-text
  <img
    className={classNames('nudge-arrow', className)}
    style={placementStyle({ top, left }, style)}
    {...props}
  />
);

export const NudgeCloseIcon = ({ className, ...props }: React.SVGAttributes<SVGSVGElement>) => (
  <TimesIcon className={classNames('nudge-close-icon', className)} {...props} />
);

type NudgeCloseButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & Placement;

export const NudgeCloseButton = React.forwardRef<HTMLButtonElement, NudgeCloseButtonProps>(
  function NudgeCloseButton({ className, style, top, left, ...props }, ref) {
    return <PlainButton
      ref={ref}
      className={classNames('nudge-close-button', className)}
      style={placementStyle({ top, left }, style)}
      {...props}
    />;
  }
);

interface NudgeSpotlightPlacement extends Placement {
  height: number;
  width: number;
}

type NudgeBackgroundProps = React.HTMLAttributes<HTMLDivElement> & NudgeSpotlightPlacement;

export const NudgeBackground = (
  { className, style, top, left, height, width, ...props }: NudgeBackgroundProps
) => (
  <div
    className={classNames('nudge-background', className)}
    style={{
      ...overlayZIndex,
      // longhands, not the `grid-template` shorthand: the shorthand would reset
      // the grid-template-areas that NudgeStudyTools.css defines
      gridTemplateRows: `${top}px ${height}px 1fr`,
      gridTemplateColumns: `${left}px ${width}px 1fr`,
      ...style,
    }}
    {...props}
  />
);

interface ClickBlockerProps extends React.HTMLAttributes<HTMLDivElement> {
  area: 'top' | 'right' | 'bottom' | 'left';
}

export const ClickBlocker = ({ className, area, ...props }: ClickBlockerProps) => (
  <div className={classNames('nudge-click-blocker', `nudge-click-blocker-${area}`, className)} {...props} />
);
