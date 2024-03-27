import React from 'react';
import { useIntl } from 'react-intl';
import styled, { css } from 'styled-components/macro';
import { QuestionCircle } from 'styled-icons/fa-regular/QuestionCircle';
import { PlainButton } from '../../../../components/Button';
import { textRegularSize } from '../../../../components/Typography';
import theme from '../../../../theme';
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
export const UsingThisGuideButtonWrapper = styled(PlainButton)`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  overflow: visible;
  color: ${theme.color.primary.gray.base};
  position: relative;
  padding: ${buttonPaddingTopDesktop}rem ${mobilePaddingSides}rem ${buttonPaddingBottomDesktop}rem;
  height: 100%;
  margin-right: 3.2rem;
  margin-top: ${buttonMarginTopDesktop}rem;
  ${({isOpen}) => isOpen && css`
    background: ${theme.color.black};
    color: ${theme.color.white};
  `}
  ${theme.breakpoints.mobile(css`
    margin-right: 0.8rem;
    padding-right: 1.4rem;
    padding-left: 1.4rem;
  `)}
  ${disablePrint}
`;

// tslint:disable-next-line:variable-name
const UsingThisGuideText = styled.span`
  ${textRegularSize};
  font-weight: 600;
  margin-left: 0.5rem;
  ${theme.breakpoints.mobile(css`
    display: none;
  `)}
`;

interface Props {
  onClick: () => void;
  open: boolean;
}

// tslint:disable-next-line:variable-name
const UsingThisGuideButton = (props: Props) => {
  const text = useIntl().formatMessage({id: 'i18n:studyguides:popup:using-this-guide'});

  return <UsingThisGuideButtonWrapper
    type='button'
    aria-label={text}
    aria-expanded={props.open}
    aria-controls='using-this-guide-text'
    onClick={props.onClick}
    isOpen={props.open}
    data-analytics-disable-track={true}
  >
    <QuestionIcon/>
    <UsingThisGuideText id='using-this-guide-text'>{text}</UsingThisGuideText>
  </UsingThisGuideButtonWrapper>;
};

export default UsingThisGuideButton;
