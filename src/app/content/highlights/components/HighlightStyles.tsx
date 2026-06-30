import React from 'react';
// NOTE: This file has been fully migrated from styled-components to plain CSS.
// All 18 components now use HighlightStyles.css for styling:
// - Wrapper components (2): GridWrapper, MyHighlightsWrapper
// - Image components (4): FirstImage, SecondImage, ImageWrapper, ImagesGrid
// - Sticky note components (6): StickyNoteBullet, StickyNote, BlueStickyNote, GreenStickyNote, StickyNoteUl, StickyNoteLi
// - Text wrapper components (4): GeneralText, GeneralTextWrapper, GeneralLeftText, GeneralCenterText
// - Other components (2): MyHighlightsImage, StyledHiddenLiveRegion
//
// The file no longer imports styled-components. All styling is done via plain CSS classes
// with className composition using the classnames package.
import htmlMessage from '../../../components/htmlMessage';
import { H3 } from '../../../components/Typography';
import classNames from 'classnames';
import './HighlightStyles.css';

export const myHighlightsImageWidth = 72.8;
export const myHighlightsImageHeight = 23.2;

export const stickyNoteMeasures = {
  blue: 'rgb(13, 192, 220)',
  bulletSize: 1.6,
  defaultOffset: 3.2,
  green: 'rgb(99, 165, 36)',
  left: 32.8,
  opacity: '0.85',
  width: 29.8, /* to allow text to fit in one line with tooltip */
};

type SimpleWrapper = React.PropsWithChildren<{}>

// Migrated to plain CSS - see HighlightStyles.css
export const FirstImage = (
  { ...props }: Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'className'>
) => (
  <img alt="" {...props} className="first-image" />
);

export const SecondImage = (
  { ...props }: Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'className'>
) => (
  <img alt="" {...props} className="second-image" />
);

export const ImageWrapper = ({children}: SimpleWrapper) => (
  <div className="image-wrapper">
    {children}
  </div>
);

// Migrated to plain CSS - see HighlightStyles.css
export const StickyNoteBullet = () => (
  <div className="sticky-note-bullet" />
);

export const BlueStickyNote = ({children}: SimpleWrapper) => (
  <div className="blue-sticky-note">
    {children}
  </div>
);

export const GreenStickyNote = ({children}: SimpleWrapper) => (
  <div className="green-sticky-note">
    {children}
  </div>
);

export const StickyNoteUl = ({children}: SimpleWrapper) => (
  <ul className="sticky-note-ul">
    {children}
  </ul>
);

export const StickyNoteLi = ({children}: SimpleWrapper) => (
  <li className="sticky-note-li">
    {children}
  </li>
);

export const GridWrapper = ({children}: SimpleWrapper) => (
  <div className="grid-wrapper">
    {children}
  </div>
);

export const ImagesGrid = ({children}: SimpleWrapper) => (
  <div className="images-grid">
    {children}
  </div>
);

export const GeneralText = ({children}: SimpleWrapper) => (
  <H3 className="general-text">
    {children}
  </H3>
);

export const GeneralTextWrapper = ({className, children}: SimpleWrapper & {className?: string} ) => (
  <div className={classNames('general-text-wrapper', className)} >
    {children}
  </div>
);

export const LoginText = htmlMessage('i18n:toolbar:highlights:popup:login-text', GeneralTextWrapper);

export const MyHighlightsWrapper = ({children}: SimpleWrapper) => (
  <div className="my-highlights-wrapper">
    {children}
  </div>
);

export const GeneralLeftText = ({children}: SimpleWrapper) => (
  <GeneralTextWrapper className="general-left-text">
    {children}
  </GeneralTextWrapper>
);

export const GeneralCenterText = ({children}: SimpleWrapper) => (
  <GeneralTextWrapper className="general-center-text">
    {children}
  </GeneralTextWrapper>
);

// Migrated to plain CSS - see HighlightStyles.css
export const MyHighlightsImage = (
  { className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>
) => (
  <img alt="" {...props} className={classNames('my-highlights-image', className)} />
);

export const StyledHiddenLiveRegion = (
  { className, ...props }: React.HTMLAttributes<HTMLDivElement>
) => (
  <div {...props} className={classNames('styled-hidden-live-region', className)} />
);
