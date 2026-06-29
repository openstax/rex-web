import React from 'react';
// NOTE: This file is partially migrated to plain CSS. Two wrapper components (GridWrapper and
// MyHighlightsWrapper) have been migrated and use HighlightStyles.css. The remaining ~15 styled
// components (image components, sticky note components, text wrappers, etc.) will be migrated in
// future work. They remain here using styled-components due to their complexity (component
// selectors, nested pseudo-elements, calculated values, and component inheritance patterns).
import styled, { css } from 'styled-components/macro';
import htmlMessage from '../../../components/htmlMessage';
import { bodyCopyRegularStyle } from '../../../components/Typography';
import { H3, h4Style } from '../../../components/Typography';
import theme from '../../../theme';
import { desktopPopupWidth, popupBodyPadding, popupPadding } from '../../styles/PopupStyles';
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

export const imageStyles = css`
  height: 25.6rem;
  width: 36rem;
  box-shadow: 0.1rem 0.1rem 0.4rem 0 rgba(0, 0, 0, 20);
`;

export const FirstImage = styled.img`
  ${imageStyles}
`;

export const SecondImage = styled.img`
  ${imageStyles}
  margin-top: 17.6rem;
`;

export const ImageWrapper = styled.div`
  width: ${(desktopPopupWidth - popupBodyPadding) / 2}rem;
`;

export const StickyNoteBullet = styled.div`
  position: absolute;
  height: ${stickyNoteMeasures.bulletSize * 2}rem;
  width: ${stickyNoteMeasures.bulletSize}rem;
  top: 50%;
  overflow: hidden;

  ::after {
    content: "";
    position: absolute;
    width: ${stickyNoteMeasures.bulletSize}rem;
    height: ${stickyNoteMeasures.bulletSize}rem;
    transform: rotate(45deg);
    top: ${stickyNoteMeasures.bulletSize / 2}rem;
    box-shadow: 0.1rem 0.1rem 0.4rem 0 rgba(0, 0, 0, 30);
  }
`;

export const StickyNote = styled.div`
  width: ${stickyNoteMeasures.width}rem;
  position: absolute;
  padding: ${stickyNoteMeasures.bulletSize}rem ${popupBodyPadding}rem;
  overflow: visible;
  box-shadow: 0.1rem 0.1rem 0.4rem 0 rgba(0, 0, 0, 30);
  opacity: ${stickyNoteMeasures.opacity};
`;

export const BlueStickyNote = styled(StickyNote)`
  background: ${stickyNoteMeasures.blue};
  top: ${stickyNoteMeasures.defaultOffset}rem;
  left: ${stickyNoteMeasures.left + (stickyNoteMeasures.bulletSize / 2)}rem;

  ${StickyNoteBullet} {
    transform: translate(-100%, -50%);
    left: 0%;

    ::after {
      transform: rotate(45deg);
      left: ${stickyNoteMeasures.bulletSize / 2}rem;
      background: ${stickyNoteMeasures.blue};
    }
  }
`;

export const GreenStickyNote = styled(StickyNote)`
  background: ${stickyNoteMeasures.green};
  bottom: ${stickyNoteMeasures.defaultOffset}rem;
  right: ${stickyNoteMeasures.left + (stickyNoteMeasures.bulletSize / 2)}rem;

  ${StickyNoteBullet} {
    transform: translate(100%, -50%);
    right: 0%;

    ::after {
      transform: rotate(-45deg);
      right: ${stickyNoteMeasures.bulletSize / 2}rem;
      background: ${stickyNoteMeasures.green};
    }
  }
`;

export const StickyNoteUl = styled.ul`
  padding: 0;
  overflow: visible;
  margin: 0;
  list-style: none;
`;

export const StickyNoteLi = styled.li`
  ${h4Style}
  overflow: visible;
  padding: 0;
  display: flex;
  color: ${theme.color.neutral.base};

  ::before {
    content: "\\2022";
    padding-right: 0.5rem;
  }
`;

// Migrated to plain CSS - see HighlightStyles.css
export const GridWrapper = (
  { className, theme: _theme, ...props }: React.HTMLAttributes<HTMLDivElement> & { theme?: unknown }
) => (
  <div {...props} className={classNames('grid-wrapper', className)} />
);

export const ImagesGrid = styled.div`
  display: flex;
  position: relative;
  justify-content: space-between;
  overflow: visible;
`;

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
