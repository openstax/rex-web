import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components/macro';
import { textRegularStyle } from '../../../components/Typography';
import { LinkedArchiveTreeSection } from '../../types';
import PQButton from './PQButton';

// tslint:disable-next-line: variable-name
const StyledNextSectionMessage = styled.div`
  ${PQButton} {
    margin-top: 4rem;
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
    <PQButton onClick={onClick}>
      <FormattedMessage id='i18n:practice-questions:popup:continue'>
        {(msg: string) => msg}
      </FormattedMessage>
    </PQButton>
  </StyledNextSectionMessage>
);

export default NextSectionMessage;
