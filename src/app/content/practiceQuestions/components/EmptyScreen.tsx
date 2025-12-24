import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';
import styled from 'styled-components/macro';
import { textRegularStyle } from '../../../components/Typography';
import { LinkedArchiveTreeSection } from '../../types';
import { setSelectedSection } from '../actions';
import NextSectionMessage from './NextSectionMessage';

const StyledEmptyScreen = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin: 2rem auto;
  flex: 1;
  text-align: center;
  ${textRegularStyle}
`;

const StyledText = styled.span`
  margin-bottom: 3rem;
  max-width: 38rem;
  overflow: initial;
`;

interface EmptyScreenProps {
  nextSection: LinkedArchiveTreeSection;
}

const EmptyScreen = ({ nextSection }: EmptyScreenProps) => {
  const dispatch = useDispatch();

  return <StyledEmptyScreen>
    <StyledText>
      <FormattedMessage id='i18n:practice-questions:popup:empty:message'>
        {(msg) => msg}
      </FormattedMessage>
    </StyledText>
    <NextSectionMessage
      nextSection={nextSection}
      messageKey='i18n:practice-questions:popup:empty:next-section'
      onClick={() => dispatch(setSelectedSection(nextSection))}
      analyticsLabel='Continue (Empty Screen)'
    />
  </StyledEmptyScreen>;
};

export default EmptyScreen;
