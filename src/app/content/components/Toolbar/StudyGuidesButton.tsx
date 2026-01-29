import React from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components/macro';
import studyGuidesIcon from '../../../../assets/studyGuidesIcon.svg';
import { useAnalyticsEvent } from '../../../../helpers/analytics';
import { openStudyGuides as openStudyGuidesAction } from '../../studyGuides/actions';
import { hasStudyGuides, studyGuidesEnabled, studyGuidesOpen } from '../../studyGuides/selectors';
import { toolbarIconStyles } from './iconStyles';
import { PlainButton, toolbarDefaultButton, toolbarDefaultText } from './styled';
import { captureOpeningElement } from '../../utils/focusManager';

export const StudyGuidesWrapper = styled(PlainButton)`
  ${toolbarDefaultButton}
  height: auto;
  padding: 0;
`;

const StudyGuidesIcon = styled.img`
  ${toolbarIconStyles}
  padding: 0.2rem;
`;

const StudyGuidesText = styled.span`
  ${toolbarDefaultText}
`;

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

  return <StudyGuidesWrapper
    isActive={isStudyGuidesOpen}
    onClick={openStudyGuidesSummary}
    aria-label={text}
    data-analytics-label='Study guides'
  >
    <StudyGuidesIcon aria-hidden='true' src={studyGuidesIcon} />
    <StudyGuidesText>{text}</StudyGuidesText>
  </StudyGuidesWrapper>;
};

export default StudyGuidesButton;
