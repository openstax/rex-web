import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';
import styled from 'styled-components/macro';
import { textRegularStyle } from '../../../components/Typography';
import { LinkedArchiveTreeSection } from '../../types';
import { setSelectedSection } from '../actions';
import NextSectionMessage, { StyledMessageText }from './NextSectionMessage';

// tslint:disable-next-line: variable-name
const StyledFinalScreen = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin: 2rem auto;
  flex: 1;
  text-align: center;
  ${textRegularStyle}
`;

// tslint:disable-next-line: variable-name
const StyledText = styled.span`
  margin-bottom: 3rem;
  max-width: 38rem;
  overflow: initial;
`;

// tslint:disable-next-line: variable-name
const StyledNextSectionMessage = styled(NextSectionMessage)`
  ${StyledMessageText}{
    display: block;
  }
`;

interface FinalScreenProps {
  nextSection?: LinkedArchiveTreeSection;
}

// tslint:disable-next-line: variable-name
const FinalScreen = ({ nextSection }: FinalScreenProps) => {
  const dispatch = useDispatch();

  return <StyledFinalScreen>
    <StyledText>
      <FormattedMessage id='i18n:practice-questions:popup:final'>
        {(msg: string) => msg}
      </FormattedMessage>
    </StyledText>
    {
      nextSection &&
      <StyledNextSectionMessage
        nextSection={nextSection}
        messageKey='i18n:practice-questions:popup:final:next-section'
        onClick={() => dispatch(setSelectedSection(nextSection))}
      />
    }
  </StyledFinalScreen>;
};

export default FinalScreen;
