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
  { className, ...props }: React.HTMLAttributes<HTMLDivElement> & { theme?: unknown }
) => (
  <StickyNote {...props} className={classNames('blue-sticky-note', className)} />
);

export const GreenStickyNote = (
  { className, ...props }: React.HTMLAttributes<HTMLDivElement> & { theme?: unknown }
) => (
  <StickyNote {...props} className={classNames('green-sticky-note', className)} />
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

// Migrated to plain CSS - see HighlightStyles.css
export function GeneralText(props: React.ComponentProps<typeof H3>) {
  const { className, ...rest } = props;
  return <H3 {...rest} className={classNames('general-text', className)} />;
}

export const GeneralTextWrapper = (
  { className, theme: _theme, ...props }: React.HTMLAttributes<HTMLDivElement> & { theme?: unknown }
) => (
  <div {...props} className={classNames('general-text-wrapper', className)} />
);

export const LoginText = htmlMessage('i18n:toolbar:highlights:popup:login-text', GeneralTextWrapper);

// Migrated to plain CSS - see HighlightStyles.css
export const MyHighlightsWrapper = (
  { className, theme: _theme, ...props }: React.HTMLAttributes<HTMLDivElement> & { theme?: unknown }
) => (
  <div {...props} className={classNames('my-highlights-wrapper', className)} />
);

// Migrated to plain CSS - see HighlightStyles.css
export const GeneralLeftText = (
  { className, ...props }: React.HTMLAttributes<HTMLDivElement> & { theme?: unknown }
) => (
  <GeneralTextWrapper {...props} className={classNames('general-left-text', className)} />
);

export const GeneralCenterText = (
  { className, ...props }: React.HTMLAttributes<HTMLDivElement> & { theme?: unknown }
) => (
  <GeneralTextWrapper {...props} className={classNames('general-center-text', className)} />
);

// Migrated to plain CSS - see HighlightStyles.css
export const MyHighlightsImage = (
  { className, theme: _theme, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { theme?: unknown }
) => (
  <img alt="" {...props} className={classNames('my-highlights-image', className)} />
);

export const StyledHiddenLiveRegion = (
  { className, theme: _theme, ...props }: React.HTMLAttributes<HTMLDivElement> & { theme?: unknown }
) => (
  <div {...props} className={classNames('styled-hidden-live-region', className)} />
);
