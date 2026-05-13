import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import Button from '../../../components/Button';
import { nextQuestion } from '../actions';
import * as pqSelectors from '../selectors';
import './IntroScreen.css';

const IntroScreen = () => {
  const questionsCount = useSelector(pqSelectors.questionsCount);
  const dispatch = useDispatch();

  return <div className="intro-screen-wrapper">
    <span className="intro-screen-message">
      <FormattedMessage id='i18n:practice-questions:popup:intro:message' values={{ questions: questionsCount }}>
        {(msg) => msg}
      </FormattedMessage>
    </span>
    <Button
      className="intro-screen-button"
      variant='primary'
      size='large'
      onClick={() => dispatch(nextQuestion())}
      data-analytics-label='Start now'
    >
      <FormattedMessage id='i18n:practice-questions:popup:intro:start'>
        {(msg) => msg}
      </FormattedMessage>
    </Button>
  </div>;
};

export default IntroScreen;
