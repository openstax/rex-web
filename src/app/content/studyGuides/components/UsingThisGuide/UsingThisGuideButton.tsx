import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled, { css } from 'styled-components/macro';
import { PlainButton } from '../../../../components/Button';
import theme from '../../../../theme';
import { toolbarDefaultText } from '../../../components/Toolbar/styled';
import { QuestionCircle } from 'styled-icons/fa-regular/QuestionCircle';
import { mobilePaddingSides } from '../../../styles/PopupConstants';

const UTGButton = {
  height: 6,
  marginBottom: 0.6,
  negativeMarginBottom: 0.1
}

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
  position: relative;
  overflow: visible;
  color: ${(props) => props.isOpen ? theme.color.white : theme.color.primary.gray.base};
  background: ${(props) => props.isOpen ? 'black' : 'white'};
  padding:  ${(props) => props.isOpen ? '0 1.6rem' : '0'};
  height: ${UTGButton.height - UTGButton.marginBottom}rem;
`;

// tslint:disable-next-line:variable-name
const UsingThisGuideText = styled.span`
  ${toolbarDefaultText}; 
`;

// tslint:disable-next-line:variable-name
const UsingThisGuideWrapper = styled.div`
  margin-right: 4.8rem;
  margin-bottom: ${(props) => props.isOpen ? -(UTGButton.marginBottom + UTGButton.negativeMarginBottom) : '0'}rem;
  ${theme.breakpoints.mobile(css`
    margin-right: ${mobilePaddingSides}rem;
  `)}
`;

interface Props {
  onClick: () => void;
  open: boolean;
}

// tslint:disable-next-line:variable-name
const UsingThisGuideButton = (props: Props) => {
  return <UsingThisGuideWrapper isOpen={props.open}>
    <FormattedMessage id='i18n:studyguides:popup:using-this-guide'>
      {(msg: Element | string) =>
        <UsingThisGuideButtonWrapper onClick={props.onClick} aria-label={msg} isOpen={props.open}>
          <QuestionIcon/>
          <UsingThisGuideText>{msg}</UsingThisGuideText>
        </UsingThisGuideButtonWrapper>
      }
    </FormattedMessage>
  </UsingThisGuideWrapper>;
};

export default UsingThisGuideButton;
