import React from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import HighlightsIcon from '../../../../assets/HighlightsIcon';
import { useAnalyticsEvent } from '../../../../helpers/analytics';
import { openMyHighlights as openMyHighlightsAction } from '../../highlights/actions';
import * as selectors from '../../highlights/selectors';
import showConfirmation from '../../highlights/components/utils/showConfirmation';
import { useServices } from '../../../context/Services';
import { hasUnsavedHighlight as hasUnsavedHighlightSelector } from '../../highlights/selectors';
import { captureOpeningElement } from '../../utils/focusManager';
import { ToolbarDefaultButton, ToolbarDefaultText } from './ToolbarDefaults';

const HighlightButton = () => {
  const dispatch = useDispatch();
  const myHighlightsOpen = useSelector(selectors.myHighlightsOpen);
  const hasUnsavedHighlight = useSelector(hasUnsavedHighlightSelector);
  const services = useServices();
  const trackOpenCloseMH = useAnalyticsEvent('openCloseMH');

  const openHighlightsSummary = async() => {
    if (hasUnsavedHighlight) {
      const confirmed = await showConfirmation(services);
      if (!confirmed) return;
    }
    captureOpeningElement('highlights');
    dispatch(openMyHighlightsAction());
    trackOpenCloseMH();
  };

  const text = useIntl().formatMessage({id: 'i18n:toolbar:highlights:text'});

  return <ToolbarDefaultButton
    isActive={myHighlightsOpen}
    onClick={openHighlightsSummary}
    aria-label={text}
    data-analytics-label='My highlights'
  >
    <HighlightsIcon />
    <ToolbarDefaultText>{text}</ToolbarDefaultText>
  </ToolbarDefaultButton>;
};

export default HighlightButton;
