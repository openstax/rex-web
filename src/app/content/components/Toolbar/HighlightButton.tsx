import React from 'react';
import { useIntl } from 'react-intl';
import { connect, useSelector } from 'react-redux';
import classNames from 'classnames';
import HighlightsIcon from '../../../../assets/HighlightsIcon';
import { useAnalyticsEvent } from '../../../../helpers/analytics';
import { AppState, Dispatch } from '../../../types';
import { openMyHighlights as openMyHighlightsAction } from '../../highlights/actions';
import * as selectors from '../../highlights/selectors';
import { practiceQuestionsEnabled as practiceQuestionsEnabledSelector } from '../../practiceQuestions/selectors';
import { PlainButton } from './styled';
import showConfirmation from '../../highlights/components/utils/showConfirmation';
import { useServices } from '../../../context/Services';
import { hasUnsavedHighlight as hasUnsavedHighlightSelector } from '../../highlights/selectors';
import { captureOpeningElement } from '../../utils/focusManager';
import './Toolbar.css';

interface Props {
  openMyHighlights: () => void;
  myHighlightsOpen?: boolean;
}

const MyHighlightsWrapper = function MyHighlightsWrapper({
  isActive,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  isActive?: boolean;
  practiceQuestionsEnabled?: boolean;
}) {
  return (
    <PlainButton
      {...props}
      className={classNames(
        'toolbar-default-button',
        { 'is-active': isActive },
        className
      )}
    />
  );
};

const MyHighlightsText = function MyHighlightsText({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      {...props}
      className={classNames('toolbar-default-text', className)}
    />
  );
};

const HighlightButton = ({ openMyHighlights, myHighlightsOpen }: Props) => {
  const practiceQuestionsEnabled = useSelector(practiceQuestionsEnabledSelector);
  const hasUnsavedHighlight = useSelector(hasUnsavedHighlightSelector);
  const services = useServices();
  const trackOpenCloseMH = useAnalyticsEvent('openCloseMH');

  const openHighlightsSummary = async() => {
    if (hasUnsavedHighlight) {
      const confirmed = await showConfirmation(services);
      if (!confirmed) return;
    }
    captureOpeningElement('highlights');
    openMyHighlights();
    trackOpenCloseMH();
  };

  const text = useIntl().formatMessage({id: 'i18n:toolbar:highlights:text'});

  return <MyHighlightsWrapper
    isActive={myHighlightsOpen}
    onClick={openHighlightsSummary}
    aria-label={text}
    data-analytics-label='My highlights'
    practiceQuestionsEnabled={practiceQuestionsEnabled}
  >
    <HighlightsIcon className="toolbar-default-icon" />
    <MyHighlightsText>{text}</MyHighlightsText>
  </MyHighlightsWrapper>;
};

export default connect(
  (state: AppState) => ({
    myHighlightsOpen: selectors.myHighlightsOpen(state),
  }),
  (dispatch: Dispatch) => ({
    openMyHighlights: () => dispatch(openMyHighlightsAction()),
  })
)(HighlightButton);
