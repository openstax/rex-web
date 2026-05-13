import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';
import { LinkedArchiveTreeSection } from '../../types';
import { setSelectedSection } from '../actions';
import NextSectionMessage from './NextSectionMessage';
import './EmptyScreen.css';

interface EmptyScreenProps {
  nextSection: LinkedArchiveTreeSection;
}

export const EmptyScreenStatus = () => (
  <div className="empty-screen">
    <span className="empty-screen-text">
      <FormattedMessage id='i18n:practice-questions:popup:empty:message' />
    </span>
  </div>
);

const EmptyScreen = ({ nextSection }: EmptyScreenProps) => {
  const dispatch = useDispatch();

  return (
    <div className="empty-screen">
      <NextSectionMessage
        nextSection={nextSection}
        messageKey='i18n:practice-questions:popup:empty:next-section'
        onClick={() => dispatch(setSelectedSection(nextSection))}
        analyticsLabel='Continue (Empty Screen)'
      />
    </div>
  );
};

export default EmptyScreen;
