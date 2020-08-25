import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled, { css } from 'styled-components/macro';
import { QuestionCircle } from 'styled-icons/fa-regular/QuestionCircle';
import { PlainButton } from '../../../../components/Button';
import theme from '../../../../theme';
import { toolbarDefaultText } from '../../../components/Toolbar/styled';
import { filters, mobilePaddingSides } from '../../../styles/PopupConstants';

const buttonPaddingTopDesktop = 0.6;
const buttonPaddingTopMobile = 0.5;

// tslint:disable-next-line:variable-name
const QuestionIcon = styled(QuestionCircle)`
  height: 1.7rem;
  width: 1.7rem;
`;

// tslint:disable-next-line:variable-name
const UsingThisGuideButtonInnerStyles = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  overflow: visible;
  color: ${theme.color.primary.gray.base};
  position: relative;
  padding:
    ${filters.dropdownToggle.topBottom.desktop - buttonPaddingTopDesktop}rem
    ${mobilePaddingSides}rem ${mobilePaddingSides}rem;
  outline: none;
  ${({isOpen}) => isOpen && css`
    color: ${theme.color.white};
  `}
  ${theme.breakpoints.mobile(css`
    padding: ${mobilePaddingSides - (buttonPaddingTopMobile / 2)}rem
      ${mobilePaddingSides - 0.2}rem ${mobilePaddingSides + (buttonPaddingTopMobile / 2)}rem;
  `)}
`;

// tslint:disable-next-line:variable-name
export const UsingThisGuideButtonWrapper = styled(PlainButton)`
  position: relative;
  height: 100%;
  margin-right: 3.2rem;
  margin-top: ${buttonPaddingTopDesktop}rem;
  ${({isOpen}) => isOpen && css`
    background: ${theme.color.black};
  `}
  ${theme.breakpoints.mobile(css`
    margin-right: 0.8rem;
  `)}
`;

// tslint:disable-next-line:variable-name
const UsingThisGuideText = styled.span`
  ${toolbarDefaultText}
`;

interface Props {
  onClick: () => void;
  open: boolean;
}

// tslint:disable-next-line:variable-name
const UsingThisGuideButton = (props: Props) => {
  return <FormattedMessage id='i18n:studyguides:popup:using-this-guide'>
      {(msg: Element | string) =>
        <UsingThisGuideButtonWrapper aria-label={msg} onClick={props.onClick} isOpen={props.open}>
          <UsingThisGuideButtonInnerStyles isOpen={props.open} tabIndex={-1}>
            <QuestionIcon/>
            <UsingThisGuideText>{msg}</UsingThisGuideText>
          </UsingThisGuideButtonInnerStyles>
        </UsingThisGuideButtonWrapper>
      }
    </FormattedMessage>;
};

export default UsingThisGuideButton;
