import React from 'react';
// NOTE: This file has been fully migrated from styled-components to plain CSS.
// All styling is now handled by HighlightStyles.css for:
// - Wrapper components (2): GridWrapper, MyHighlightsWrapper
// - Image components (4): FirstImage, SecondImage, ImageWrapper, ImagesGrid
// - Sticky note components (5): StickyNoteBullet, BlueStickyNote, GreenStickyNote, StickyNoteUl, StickyNoteLi (plus base `.sticky-note` CSS class)
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

type SimpleWrapper = React.PropsWithChildren<{}>;

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

const StickyNote = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props} className={classNames('sticky-note', className)}>
    {children}
  </div>
);

export const BlueStickyNote = ({children}: SimpleWrapper) => (
  <StickyNote className="blue-sticky-note">
    {children}
  </StickyNote>
);

export const GreenStickyNote = ({children}: SimpleWrapper) => (
  <StickyNote className="green-sticky-note">
    {children}
  </StickyNote>
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

export const GeneralTextWrapper = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props} className={classNames('general-text-wrapper', className)}>
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
