import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled, { css } from 'styled-components/macro';
import { PlainButton } from '../../../../components/Button';
import theme from '../../../../theme';
import { toolbarDefaultText } from '../../../components/Toolbar/styled';
import { QuestionCircle } from 'styled-icons/fa-regular/QuestionCircle';
import { mobilePaddingSides, filters } from '../../../styles/PopupConstants';

const buttonPaddingTopDesktop = 0.7;
const buttonPaddingTopMobile = 0.5;

// tslint:disable-next-line:variable-name
const QuestionIcon = styled(QuestionCircle)`
  height: 1.7rem;
  width: 1.7rem;
`;

// tslint:disable-next-line:variable-name
export const UsingThisGuideButtonBackground = styled.div`
  position: relative;
  height: 100%;
  margin-right: 3.2rem;
  padding-top: ${buttonPaddingTopDesktop}rem;
  ${theme.breakpoints.mobile(css`
    margin-right: 0.8rem;
    padding-top: ${buttonPaddingTopMobile}rem;
  `)}
`;

// tslint:disable-next-line:variable-name
export const UsingThisGuideButtonWrapper = styled(PlainButton)`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  overflow: visible;
  color: ${theme.color.primary.gray.base};
  position: relative;
  padding: ${filters.dropdownToggle.topBottom.desktop - buttonPaddingTopDesktop}rem ${mobilePaddingSides}rem ${mobilePaddingSides}rem;
  ${({isOpen}) => isOpen && css`
    color: ${theme.color.white};
    background: ${theme.color.black};
    outline: none;
  `}

  ${theme.breakpoints.mobile(css`
    padding: ${mobilePaddingSides - (buttonPaddingTopMobile/2)}rem ${mobilePaddingSides - 0.2}rem ${mobilePaddingSides + (buttonPaddingTopMobile/2)}rem;
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
  return <UsingThisGuideButtonBackground>
    <FormattedMessage id='i18n:studyguides:popup:using-this-guide'>
      {(msg: Element | string) =>
        <UsingThisGuideButtonWrapper onClick={props.onClick} aria-label={msg} isOpen={props.open}>
          <QuestionIcon/>
          <UsingThisGuideText>{msg}</UsingThisGuideText>
        </UsingThisGuideButtonWrapper>
      }
    </FormattedMessage>
  </UsingThisGuideButtonBackground>;
};

export default UsingThisGuideButton;
