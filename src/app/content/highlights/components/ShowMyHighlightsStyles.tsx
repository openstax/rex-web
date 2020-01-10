import styled, { css } from 'styled-components';
import { AngleUp } from 'styled-icons/fa-solid/AngleUp';
import { DropdownList, DropdownFocusWrapper } from '../../../components/Dropdown';
import { bodyCopyRegularStyle, labelStyle, textRegularStyle, textStyle } from '../../../components/Typography';
import { h4Style } from '../../../components/Typography/headings';
import theme from '../../../theme';
import { highlightStyles } from '../constants';
import ColorPicker from './ColorPicker';
import { MenuToggle } from './DisplayNote';
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
`;

// tslint:disable-next-line:variable-name
export const ShowMyHighlightsBody = styled(PopupBody)`
  background: ${theme.color.neutral.darker};
  ${theme.breakpoints.mobile(css`
    text-align: left;
    padding: 0;
  `)}
`;

// tslint:disable-next-line:variable-name
export const HighlightWrapper = styled.div`
  margin: 1.6rem ${popupPadding}rem;
  border: solid 0.1rem ${theme.color.neutral.darkest};
  overflow: unset;
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
`;

// tslint:disable-next-line:variable-name
export const HighlightOuterWrapper = styled.div`
  position: relative;
  overflow: unset;

  :not(:last-child) {
    border-bottom: solid 0.2rem ${theme.color.neutral.darker};
  }

  background: ${theme.color.neutral.base};
`;

// tslint:disable-next-line:variable-name
export const HighlightContent = styled.div`
  ${bodyCopyRegularStyle}
  overflow: visible;

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

  textarea {
    ${textRegularStyle}
    flex: 1;
    letter-spacing: 0;
    line-height: 20px;
    color: ${theme.color.text.label};
    padding: 8px;
  }
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
`;

// tslint:disable-next-line:variable-name
export const HighlightToggleEdit = styled.div`
  .highlight-toggle-edit {
    position: absolute;
    width: 150px;
    top: 1.2rem;
    right: 0;
  }

  ${DropdownFocusWrapper} {
    svg {
      color: ${theme.color.neutral.darkest};
    }
  }

  ${MenuToggle} {
    float: right;
    margin-right: 0.2rem;

    &:hover {
      svg {
        color: ${theme.color.secondary.lightGray.darkest};
      }
    }
  }
`;

// tslint:disable-next-line:variable-name
export const HighlightEditButtons = styled.div`
  display: flex;
  align-items: center;
  padding: 0 8px;

  button:first-child {
    margin-right: 8px;
  }
`;

// tslint:disable-next-line:variable-name
export const HighlightToggleEditContent = styled.div`
  z-index: 2;
  border: 1px solid ${theme.color.neutral.formBorder};
  background-color: ${theme.color.neutral.formBackground};

  ${ColorPicker} {
    label {
      margin: 0.6rem;
      width: 1.6rem;
      height: 1.6rem;

      svg {
        width: 1.2rem;
        height: 1.2rem;
      }
    }
  }

  ${DropdownList} {
    padding: 0;

    li {
      display: flex;

      a {
        width: 100%;

        svg {
          width: 15px;
          height: 15px;
          margin-right: 10px;
          color: ${theme.color.text.default};
        }
      }
    }
  }
`;

// tslint:disable-next-line:variable-name
export const HighlightDeleteWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.9);

  span {
    ${textStyle}
    font-size: 16px;
    font-weight: 500;
    line-height: 25px;
    letter-spacing: -0.2;
    color: #fff;
    margin-right: 8px;
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
