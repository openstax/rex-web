import React from 'react';
// NOTE: This file is partially migrated to plain CSS. The following components have been migrated
// and use HighlightStyles.css:
// - GridWrapper, MyHighlightsWrapper (wrapper components)
// - FirstImage, SecondImage, ImageWrapper, ImagesGrid (image components)
// - StickyNoteBullet, StickyNote, BlueStickyNote, GreenStickyNote, StickyNoteUl, StickyNoteLi (sticky note components)
//
// The remaining 6 styled components (text wrappers and MyHighlightsImage) will be migrated in future work.
// They remain here using styled-components due to their complexity (component inheritance patterns
// and css fragments like h4Style and bodyCopyRegularStyle).
import styled from 'styled-components/macro';
import htmlMessage from '../../../components/htmlMessage';
import { bodyCopyRegularStyle } from '../../../components/Typography';
import { H3 } from '../../../components/Typography';
import { popupBodyPadding, popupPadding } from '../../styles/PopupStyles';
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

// Migrated to plain CSS - see HighlightStyles.css
export const FirstImage = (
  { className, theme: _theme, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { theme?: unknown }
) => (
  <img alt="" {...props} className={classNames('first-image', className)} />
);

export const SecondImage = (
  { className, theme: _theme, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { theme?: unknown }
) => (
  <img alt="" {...props} className={classNames('second-image', className)} />
);

export const ImageWrapper = (
  { className, theme: _theme, ...props }: React.HTMLAttributes<HTMLDivElement> & { theme?: unknown }
) => (
  <div {...props} className={classNames('image-wrapper', className)} />
);

// Migrated to plain CSS - see HighlightStyles.css
export const StickyNoteBullet = (
  { className, theme: _theme, ...props }: React.HTMLAttributes<HTMLDivElement> & { theme?: unknown }
) => (
  <div {...props} className={classNames('sticky-note-bullet', className)} />
);

export const StickyNote = (
  { className, theme: _theme, ...props }: React.HTMLAttributes<HTMLDivElement> & { theme?: unknown }
) => (
  <div {...props} className={classNames('sticky-note', className)} />
);

export const BlueStickyNote = (
  { className, theme: _theme, ...props }: React.HTMLAttributes<HTMLDivElement> & { theme?: unknown }
) => (
  <div {...props} className={classNames('sticky-note', 'blue-sticky-note', className)} />
);

export const GreenStickyNote = (
  { className, theme: _theme, ...props }: React.HTMLAttributes<HTMLDivElement> & { theme?: unknown }
) => (
  <div {...props} className={classNames('sticky-note', 'green-sticky-note', className)} />
);

export const StickyNoteUl = (
  { className, theme: _theme, ...props }: React.HTMLAttributes<HTMLUListElement> & { theme?: unknown }
) => (
  <ul {...props} className={classNames('sticky-note-ul', className)} />
);

export const StickyNoteLi = (
  { className, theme: _theme, ...props }: React.HTMLAttributes<HTMLLIElement> & { theme?: unknown }
) => (
  <li {...props} className={classNames('sticky-note-li', className)} />
);

// Migrated to plain CSS - see HighlightStyles.css
export const GridWrapper = (
  { className, theme: _theme, ...props }: React.HTMLAttributes<HTMLDivElement> & { theme?: unknown }
) => (
  <div {...props} className={classNames('grid-wrapper', className)} />
);

// Migrated to plain CSS - see HighlightStyles.css
export const ImagesGrid = (
  { className, theme: _theme, ...props }: React.HTMLAttributes<HTMLDivElement> & { theme?: unknown }
) => (
  <div {...props} className={classNames('images-grid', className)} />
);

export const GeneralText = styled(H3)`
  width: 100%;
  padding: 0.8rem 0;
`;

export const GeneralTextWrapper = styled.div`
  ${bodyCopyRegularStyle}
  padding: ${popupBodyPadding}rem ${popupPadding}rem 0;

  @media print {
    height: max-content;
    overflow: auto;
  }
`;

export const LoginText = htmlMessage('i18n:toolbar:highlights:popup:login-text', GeneralTextWrapper);

// Migrated to plain CSS - see HighlightStyles.css
export const MyHighlightsWrapper = (
  { className, theme: _theme, ...props }: React.HTMLAttributes<HTMLDivElement> & { theme?: unknown }
) => (
  <div {...props} className={classNames('my-highlights-wrapper', className)} />
);

export const GeneralLeftText = styled(GeneralTextWrapper)`
  display: flex;
  flex-direction: column;
  padding: 2rem 3.2rem;
`;

export const GeneralCenterText = styled(GeneralTextWrapper)`
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 5rem 3.2rem;
  text-align: center;
`;

export const MyHighlightsImage = styled.img`
  width: ${myHighlightsImageWidth}rem;
  height: ${myHighlightsImageHeight}rem;
  margin-top: ${popupBodyPadding}rem;
`;

export const StyledHiddenLiveRegion = styled.div`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(1px, 1px, 1px, 1px);
  white-space: nowrap;
`;
