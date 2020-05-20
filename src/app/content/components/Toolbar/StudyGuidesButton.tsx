import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import studyGuidesIcon from '../../../../assets/studyGuidesIcon.svg';
import theme from '../../../theme';
import { studyGuidesEnabled, studyGuidesSummaryIsNotEmpty } from '../../studyGuides/selectors';
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
  const isEnabled = useSelector(studyGuidesEnabled);
  const hasStudyGuides = useSelector(studyGuidesSummaryIsNotEmpty);

  if (!isEnabled || !hasStudyGuides) { return null; }

  const openStudyGuidesSummary = () => null;

  return <FormattedMessage id='i18n:toolbar:study-guides:text'>
    {(msg: Element | string) =>
      <StudyGuidesWrapper onClick={openStudyGuidesSummary} aria-label={msg}>
        <StudyGuidesIcon aria-hidden='true' src={studyGuidesIcon} />
        <StudyGuidesText>{msg}</StudyGuidesText>
      </StudyGuidesWrapper>
    }
  </FormattedMessage>;
};

export default StudyGuidesButton;
