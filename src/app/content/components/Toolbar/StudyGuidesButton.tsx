import React from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import studyGuidesIcon from '../../../../assets/studyGuidesIcon.svg';
import { useAnalyticsEvent } from '../../../../helpers/analytics';
import { openStudyGuides as openStudyGuidesAction } from '../../studyGuides/actions';
import { hasStudyGuides, studyGuidesEnabled, studyGuidesOpen } from '../../studyGuides/selectors';
import { PlainButton } from './styled';
import { captureOpeningElement } from '../../utils/focusManager';
import './Toolbar.css';

export const StudyGuidesWrapper = function StudyGuidesWrapper({
  isActive,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  isActive?: boolean;
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

const StudyGuidesIcon = function StudyGuidesIcon({
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      {...props}
      className={classNames('toolbar-default-icon', 'study-guides-icon', className)}
    />
  );
};

const StudyGuidesText = function StudyGuidesText({
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
