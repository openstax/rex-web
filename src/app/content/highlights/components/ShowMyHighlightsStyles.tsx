import styled, { css } from 'styled-components';
import { AngleUp } from 'styled-icons/fa-solid/AngleUp';
import { bodyCopyRegularStyle, labelStyle, textRegularStyle } from '../../../components/Typography';
import { h4Style } from '../../../components/Typography/headings';
import theme from '../../../theme';
import PrintButton from '../../components/Toolbar/PrintButton';
import { disablePrint } from '../../components/utils/disablePrint';
import { highlightStyles } from '../constants';
import { PopupBody, popupBodyPadding, popupPadding } from './HighlightStyles';
import { mobilePadding } from './SummaryPopup/constants';

interface HighlightsProps {
  isLoading: boolean;
}

const printStyles = {
  highlightOuterWrapper: css`
    border-width:0;
    position:relative;
    break-inside:avoid-page;
    page-break-inside:avoid;
  `,
  highlightSection: css`
    page-break-after:avoid;
  `,
  highlightsChapter: css`
    padding:0;
  `,
  highlightsWrapper: css`
    border-width:0;
    margin:0;
  `,
};

// tslint:disable-next-line: variable-name
export const Highlights = styled.div`
  position: relative;
  opacity: ${(props: HighlightsProps) => props.isLoading ? '0.5' : '1'};

  .os-divider {
    width: 0.8rem;
  }
`;

// tslint:disable-next-line: variable-name
export const LoaderWrapper = styled.div`
  position: absolute;
  width: 100%;
  height: 150px;
`;

// tslint:disable-next-line:variable-name
export const HighlightsChapter = styled.div`
  ${h4Style}
  height: 5.6rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  padding: 0 ${popupPadding}rem;
  width: 100%;
  ${theme.breakpoints.mobile(css`
    padding: 0 ${popupPadding}rem;
  `)}

  @media print{
    ${printStyles.highlightsChapter}
  }
`;

// tslint:disable-next-line:variable-name
export const ShowMyHighlightsBody = styled(PopupBody)`
  padding: 0;
  ${theme.breakpoints.mobile(css`
    text-align: left;
    padding: 0;
  `)}
`;

// tslint:disable-next-line:variable-name
export const HiglightsToolbar = styled.div`
  overflow:visible;
  display:grid;
  grid-template-columns:auto max-content;
  padding: 2.1rem 3.2rem 0 3.2rem;
  border-bottom:1px solid ${theme.color.neutral.formBorder};
  ${theme.breakpoints.mobile(css`
    align-items:center;
    padding: 0 ${mobilePadding}rem;
    height: 3.6rem;
  `)}

  ${disablePrint}
`;

// tslint:disable-next-line:variable-name
export const HiglightsPrintButton = styled(PrintButton)`
  height:max-content;
  >button{
    min-width:auto;
    height:auto;
  }
`;

// tslint:disable-next-line:variable-name
export const HighlightWrapper = styled.div`
  margin: 0 ${popupPadding}rem 1.6rem;
  border: solid 0.1rem ${theme.color.neutral.darkest};

  @media print{
    ${printStyles.highlightsWrapper}
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

  > span {
    overflow: hidden;
  }

  @media print{
    ${printStyles.highlightSection}
  }
`;

// tslint:disable-next-line:variable-name
export const HighlightOuterWrapper = styled.div`
  :not(:last-child) {
    border-bottom: solid 0.2rem ${theme.color.neutral.darker};
  }

  background: ${theme.color.neutral.base};

  @media print{
    ${printStyles.highlightOuterWrapper}
  }
`;

// tslint:disable-next-line:variable-name
export const HighlightContent = styled.div`
  ${bodyCopyRegularStyle}

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
export const HighlightContentWrapper = styled.div`
  padding: 1.2rem ${popupBodyPadding}rem;
  ${(props: { color: string }) => {
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
