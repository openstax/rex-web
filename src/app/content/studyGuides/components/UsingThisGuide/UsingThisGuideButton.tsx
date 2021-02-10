import React from 'react';
import { useIntl } from 'react-intl';
import styled, { css } from 'styled-components/macro';
import { QuestionCircle } from 'styled-icons/fa-regular/QuestionCircle';
import { PlainButton } from '../../../../components/Button';
import theme from '../../../../theme';
import { toolbarDefaultText } from '../../../components/Toolbar/styled';
import { disablePrint } from '../../../components/utils/disablePrint';
import { mobilePaddingSides } from '../../../styles/PopupConstants';

const buttonMarginTopDesktop = 0.6;
const buttonPaddingTopDesktop = 1.2;
const buttonPaddingBottomDesktop = 1.8;

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
  padding: ${buttonPaddingTopDesktop}rem ${mobilePaddingSides}rem ${buttonPaddingBottomDesktop}rem;
  outline: none;
  ${({isOpen}) => isOpen && css`
    color: ${theme.color.white};
  `}
  ${theme.breakpoints.mobile(css`
    padding-right: 1.4rem;
    padding-left: 1.4rem;
  `)}
  ${disablePrint}
`;

// tslint:disable-next-line:variable-name
export const UsingThisGuideButtonWrapper = styled(PlainButton)`
  position: relative;
  height: 100%;
  margin-right: 3.2rem;
  margin-top: ${buttonMarginTopDesktop}rem;
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
  const text = useIntl().formatMessage({id: 'i18n:studyguides:popup:using-this-guide'});

  return <UsingThisGuideButtonWrapper
    aria-label={text}
    onClick={props.onClick}
    isOpen={props.open}
    data-analytics-disable-track={true}
  >
    <UsingThisGuideButtonInnerStyles isOpen={props.open} tabIndex={-1}>
      <QuestionIcon/>
      <UsingThisGuideText>{text}</UsingThisGuideText>
    </UsingThisGuideButtonInnerStyles>
  </UsingThisGuideButtonWrapper>;
};

export default UsingThisGuideButton;
