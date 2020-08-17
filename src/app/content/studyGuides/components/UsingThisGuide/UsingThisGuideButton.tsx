import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled, { css } from 'styled-components/macro';
import { PlainButton } from '../../../../components/Button';
import theme from '../../../../theme';
import { toolbarDefaultText } from '../../../components/Toolbar/styled';
import { QuestionCircle } from 'styled-icons/fa-regular/QuestionCircle';
import { mobilePaddingSides } from '../../../styles/PopupConstants';

// tslint:disable-next-line:variable-name
const QuestionIcon = styled(QuestionCircle)`
  height: 1.6rem;
  width: 1.6rem;
`;

// tslint:disable-next-line:variable-name
export const UsingThisGuideButtonWrapper = styled(PlainButton)`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  margin-right: 3.2rem;
  overflow: visible;
  color: ${theme.color.primary.gray.base};
  padding:  ${mobilePaddingSides}rem;
  position: relative;

  ${({isOpen}) => isOpen && css`
    color: ${theme.color.white};

    ::before {
      width: 100%;
      bottom: -0.7rem;
      content: "";
      background: ${theme.color.black};;
      position: absolute;
      z-index: -1;
      height: 100%;
    }
  `}

  ${theme.breakpoints.mobile(css`
    margin-right: 0.8rem;
    padding: 1.6rem 1.4rem;
  `)}
`;

// tslint:disable-next-line:variable-name
const UsingThisGuideText = styled.span`
  ${toolbarDefaultText}; 
`;

interface Props {
  onClick: () => void;
  open: boolean;
}

// tslint:disable-next-line:variable-name
const UsingThisGuideButton = (props: Props) => {
  return <FormattedMessage id='i18n:studyguides:popup:using-this-guide'>
    {(msg: Element | string) =>
      <UsingThisGuideButtonWrapper onClick={props.onClick} aria-label={msg} isOpen={props.open}>
        <QuestionIcon/>
        <UsingThisGuideText>{msg}</UsingThisGuideText>
      </UsingThisGuideButtonWrapper>
    }
  </FormattedMessage>;
};

export default UsingThisGuideButton;
