import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import studyGuidesIcon from '../../../../assets/studyGuidesIcon.svg';
import { useAnalyticsEvent } from '../../../../helpers/analytics';
import theme from '../../../theme';
import { openStudyGuides as openStudyGuidesAction } from '../../studyGuides/actions';
import { hasStudyGuides, studyGuidesEnabled } from '../../studyGuides/selectors';
import { toolbarIconStyles } from './iconStyles';
import { PlainButton, toolbarDefaultText } from './styled';

// tslint:disable-next-line:variable-name
export const StudyGuidesWrapper = styled(PlainButton)`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 2rem;
  height: auto;
  ${theme.breakpoints.mobile(css`
    margin-right: 0;
  `)}
`;

// tslint:disable-next-line:variable-name
const StudyGuidesIcon = styled.img`
  ${toolbarIconStyles}
  padding: 0.2rem;
`;

// tslint:disable-next-line:variable-name
const StudyGuidesText = styled.span`
  ${toolbarDefaultText}
`;

// tslint:disable-next-line:variable-name
const StudyGuidesButton = () => {
  const dispatch = useDispatch();
  const trackOpenClose = useAnalyticsEvent('openCloseStudyGuides');

  const isEnabled = useSelector(studyGuidesEnabled);
  const studyGuidesSummaryNotEmpty = useSelector(hasStudyGuides);

  if (!isEnabled || !studyGuidesSummaryNotEmpty) { return null; }

  const openStudyGuidesSummary = () => {
    dispatch(openStudyGuidesAction());
    trackOpenClose();
  };

  return <FormattedMessage id='i18n:toolbar:studyguides:button:text'>
    {(msg: string) =>
      <StudyGuidesWrapper onClick={openStudyGuidesSummary} aria-label={msg}>
        <StudyGuidesIcon aria-hidden='true' src={studyGuidesIcon} />
        <StudyGuidesText>{msg}</StudyGuidesText>
      </StudyGuidesWrapper>
    }
  </FormattedMessage>;
};

export default StudyGuidesButton;
