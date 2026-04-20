import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';
import theme from '../../../theme';
import { LinkedArchiveTreeSection } from '../../types';
import { setSelectedSection } from '../actions';
import NextSectionMessage from './NextSectionMessage';
import './FinalScreen.css';

interface FinalScreenProps {
  nextSection?: LinkedArchiveTreeSection;
}

export const FinalScreenStatus = () => (
  <div
    className="final-screen"
    style={{
      '--text-color': theme.color.text.default,
    } as React.CSSProperties}
  >
    <span className="final-screen-text">
      <FormattedMessage id='i18n:practice-questions:popup:final' />
    </span>
  </div>
);

const FinalScreen = ({ nextSection }: FinalScreenProps) => {
  const dispatch = useDispatch();

  if (!nextSection) {
    return null;
  }

  return (
    <div
      className="final-screen"
      style={{
        '--text-color': theme.color.text.default,
      } as React.CSSProperties}
    >
      <NextSectionMessage
        className="final-screen-next-section"
        nextSection={nextSection}
        messageKey='i18n:practice-questions:popup:final:next-section'
        onClick={() => dispatch(setSelectedSection(nextSection))}
        analyticsLabel='Continue (Final Screen)'
      />
    </div>
  );
};

export default FinalScreen;
