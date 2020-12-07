import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components/macro';
import Button from '../../../components/Button';
import { textRegularStyle } from '../../../components/Typography';
import { LinkedArchiveTreeSection } from '../../types';

// tslint:disable-next-line: variable-name
const StyledNextSectionMessage = styled.div`
  max-width: 38rem;
  overflow: initial;
  ${Button} {
    margin: 4rem auto;
  }
`;

// tslint:disable-next-line: variable-name
const StyledMessage = styled.div`
  ${textRegularStyle}
`;

// tslint:disable-next-line: variable-name
const StyledMessageText = styled.span`
  display: inline;
`;

// tslint:disable-next-line: variable-name
const StyledSectionTitle = styled.span`
  font-weight: 700;
`;

interface NextSectionMessageProps {
  nextSection: LinkedArchiveTreeSection;
  messageKey: string;
  onClick: () => void;
}

// tslint:disable-next-line: variable-name
const NextSectionMessage = ({ nextSection, messageKey, onClick }: NextSectionMessageProps) => (
  <StyledNextSectionMessage>
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
    >
      <FormattedMessage id='i18n:practice-questions:popup:continue'>
        {(msg: string) => msg}
      </FormattedMessage>
    </Button>
  </StyledNextSectionMessage>
);

export default NextSectionMessage;
