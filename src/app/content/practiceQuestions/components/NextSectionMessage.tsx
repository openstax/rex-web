import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components/macro';
import Button from '../../../components/Button';
import { textRegularStyle } from '../../../components/Typography';
import { LinkedArchiveTreeSection } from '../../types';

const StyledNextSectionMessage = styled.div`
  max-width: 38rem;
  overflow: initial;

  ${Button} {
    margin: 4rem auto;
  }
`;

const StyledMessage = styled.div`
  ${textRegularStyle}
`;

export const StyledMessageText = styled.span`
  display: inline;
`;

const StyledSectionTitle = styled.span`
  font-weight: 700;
`;

interface NextSectionMessageProps {
  nextSection: LinkedArchiveTreeSection;
  messageKey: string;
  onClick: () => void;
  analyticsLabel?: string;
  className?: string;
}

const NextSectionMessage = ({
  nextSection, messageKey, onClick, analyticsLabel, className,
}: NextSectionMessageProps) => (
  <StyledNextSectionMessage className={className}>
    <StyledMessage>
      <StyledMessageText>
        <FormattedMessage id={messageKey}>
          {(msg: string) => msg}
        </FormattedMessage>
      </StyledMessageText>
      <StyledSectionTitle dangerouslySetInnerHTML={{ __html: nextSection.title }} />
    </StyledMessage>
    <Button
      variant='primary'
      size='large'
      onClick={onClick}
      data-analytics-label={analyticsLabel}
    >
      <FormattedMessage id='i18n:practice-questions:popup:continue'>
        {(msg: string) => msg}
      </FormattedMessage>
    </Button>
  </StyledNextSectionMessage>
);

export default NextSectionMessage;
