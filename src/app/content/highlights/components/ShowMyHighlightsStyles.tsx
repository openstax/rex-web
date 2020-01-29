import styled, { css } from 'styled-components';
import { AngleUp } from 'styled-icons/fa-solid/AngleUp';
import { bodyCopyRegularStyle, labelStyle, textRegularStyle } from '../../../components/Typography';
import { h4Style } from '../../../components/Typography/headings';
import theme from '../../../theme';
import { highlightStyles } from '../constants';
import { PopupBody, popupBodyPadding, popupPadding } from './HighlightStyles';

// tslint:disable-next-line: variable-name
export const Highlights = styled.div`
  .os-divider {
    width: 0.8rem;
  }
`;

// tslint:disable-next-line: variable-name
export const LoaderWrapper = styled.div`
  position: absolute;
  width: 100%;
  height: inherit;
  background-color: rgba(241, 241, 241, 0.8);

  svg {
    margin-top: -5rem;
  }
`;

// tslint:disable-next-line:variable-name
export const HighlightsChapterWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 0 ${popupPadding}rem;
  ${theme.breakpoints.mobile(css`
    padding: 0 ${popupPadding}rem;
  `)}
`;

// tslint:disable-next-line:variable-name
export const HighlightsChapter = styled.div`
  ${h4Style}
  font-weight: bold;
  display: flex;
  align-items: baseline;
  width: 100%;
  min-height: 5.6rem;

  .os-number {
    overflow: visible;
  }

  @media print {
    padding: 0;
    background: white;
  }
`;

// tslint:disable-next-line:variable-name
export const ShowMyHighlightsBody = styled(PopupBody)`
  background: ${theme.color.neutral.darker};
  ${theme.breakpoints.mobile(css`
    text-align: left;
    padding: 0;
  `)}

  @media print {
    background: white;
  }
`;

// tslint:disable-next-line:variable-name
export const HighlightWrapper = styled.div`
  margin: 1.6rem ${popupPadding}rem;
  border: solid 0.1rem ${theme.color.neutral.darkest};

  @media print {
    border-width: 0;
    margin: 0;
  }
`;

// tslint:disable-next-line:variable-name
export const HighlightSection = styled.div`
  ${labelStyle}
  padding: 0 ${popupBodyPadding}rem 0 ${popupPadding}rem;
  background: ${theme.color.neutral.darkest};
  height: 3.2rem;
  display: flex;
  align-items: center;
  font-weight: bold;

  > .os-number,
  > .os-divider,
  > .os-text {
    overflow: hidden;
  }

  @media print {
    page-break-after: avoid;
    background: white;
  }
`;

// tslint:disable-next-line:variable-name
export const HighlightOuterWrapper = styled.div`
  :not(:last-child) {
    border-bottom: solid 0.2rem ${theme.color.neutral.darker};
  }

  background: ${theme.color.neutral.base};

  @media print {
    border-width: 0;
    position: relative;
    page-break-inside: avoid;
    background: white;
  }
`;

// tslint:disable-next-line:variable-name
export const HighlightContent = styled.div`
  ${bodyCopyRegularStyle}
  overflow: auto;

  * {
    overflow: initial;
  }
`;

// tslint:disable-next-line:variable-name
export const HighlightNote = styled.div`
  ${textRegularStyle}
  padding-top: 1.2rem;
  display: flex;

  span {
    margin: 0 0.8rem 0 0;
    overflow: visible;
  }
`;

// tslint:disable-next-line:variable-name
export const HighlightNoteAnnotation = styled.div`
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: break-word;
`;

// tslint:disable-next-line:variable-name
export const HighlightContentWrapper = styled.div`
  padding: 1.2rem ${popupBodyPadding}rem;
  ${(props: {color: string}) => {
    const style = highlightStyles.find((search) => search.label === props.color);

    if (!style) {
      return null;
    }

    return css`
      border-left: solid 0.8rem ${style.focused};

      ${HighlightContent} {
        background-color: ${style.passive};
      }

      ${HighlightNote} > span {
        color: ${style.focused};
      }
    `;
  }}

  @media print {
    ${HighlightContent} {
      background-color: white;
    }
  }
`;

// tslint:disable-next-line:variable-name
export const GoToTopWrapper = styled.div`
  width: 4.8rem;
  height: 4.8rem;
  position: absolute;
  z-index: 1;
  bottom: 4.8rem;
  right: 4.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

// tslint:disable-next-line:variable-name
export const GoToTop = styled.div`
  width: 2.4rem;
  height: 2.4rem;
  background: #959595;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

// tslint:disable-next-line:variable-name
export const GoToTopIcon = styled(AngleUp)`
  width: 1.6rem;
  height: 1.6rem;
`;
