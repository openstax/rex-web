import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled, { css } from 'styled-components/macro';
import { PlainButton } from '../../../../components/Button';
import theme from '../../../../theme';
import { toolbarDefaultText } from '../../../components/Toolbar/styled';
import { QuestionCircle } from 'styled-icons/fa-regular/QuestionCircle';
import { mobilePaddingSides } from '../../../styles/PopupConstants';

const buttonMarginTop = 0.7;

// tslint:disable-next-line:variable-name
const QuestionIcon = styled(QuestionCircle)`
  height: 1.6rem;
  width: 1.6rem;
  z-index: 2;
`;

// tslint:disable-next-line:variable-name
export const UsingThisGuideButtonBackground = styled.div`
  position: relative;
  height: 100%;
  margin-right: 3.2rem;
  ${theme.breakpoints.mobile(css`
    margin-right: 0.8rem;
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
  height: calc(100% - ${buttonMarginTop}rem);
  position: relative;
  margin-top: ${buttonMarginTop}rem;
  padding: ${mobilePaddingSides - buttonMarginTop}rem ${mobilePaddingSides}rem ${mobilePaddingSides}rem;
  ${({isOpen}) => isOpen && css`
    color: ${theme.color.white};

    ::after {
      width: 100%;
      bottom: 0rem;
      content: "";
      background: ${theme.color.black};
      position: absolute;
      z-index: 1;
      height: 100%;
    }
  `}

  ${theme.breakpoints.mobile(css`
    padding: ${mobilePaddingSides - buttonMarginTop}rem ${mobilePaddingSides - 0.2}rem ${mobilePaddingSides}rem;
  `)}
`;

// tslint:disable-next-line:variable-name
const UsingThisGuideText = styled.span`
  ${toolbarDefaultText}
  z-index: 2;
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
