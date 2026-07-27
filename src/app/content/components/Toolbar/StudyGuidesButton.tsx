import React from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import studyGuidesIcon from '../../../../assets/studyGuidesIcon.svg';
import { useAnalyticsEvent } from '../../../../helpers/analytics';
import { openStudyGuides as openStudyGuidesAction } from '../../studyGuides/actions';
import { hasStudyGuides, studyGuidesEnabled, studyGuidesOpen } from '../../studyGuides/selectors';
import { captureOpeningElement } from '../../utils/focusManager';
import { ToolbarDefaultButton, ToolbarDefaultIcon, ToolbarDefaultText } from './ToolbarDefaults';

const StudyGuidesButton = () => {
  const dispatch = useDispatch();
  const intl = useIntl();
  const trackOpen = useAnalyticsEvent('openStudyGuides');

  const isEnabled = useSelector(studyGuidesEnabled);
  const studyGuidesSummaryNotEmpty = useSelector(hasStudyGuides);
  const isStudyGuidesOpen = useSelector(studyGuidesOpen);

  if (!isEnabled || !studyGuidesSummaryNotEmpty) { return null; }

  const openStudyGuidesSummary = () => {
    captureOpeningElement('studyguides');
    dispatch(openStudyGuidesAction());
    trackOpen('button');
  };

  const text = intl.formatMessage({id: 'i18n:toolbar:studyguides:button:text'});

  return <ToolbarDefaultButton
    isActive={isStudyGuidesOpen}
    onClick={openStudyGuidesSummary}
    aria-label={text}
    data-analytics-label='Study guides'
  >
    <ToolbarDefaultIcon className='study-guides-icon' src={studyGuidesIcon} />
    <ToolbarDefaultText>{text}</ToolbarDefaultText>
  </ToolbarDefaultButton>;
};

export default StudyGuidesButton;
