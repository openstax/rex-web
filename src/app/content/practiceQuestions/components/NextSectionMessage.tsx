import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '../../../components/Button';
import { LinkedArchiveTreeSection } from '../../types';
import './NextSectionMessage.css';

interface NextSectionMessageProps {
  nextSection: LinkedArchiveTreeSection;
  messageKey: string;
  onClick: () => void;
  analyticsLabel?: string;
  className?: string;
}

const NextSectionMessage = ({
  nextSection, messageKey, onClick, analyticsLabel, className,
}: NextSectionMessageProps) => (
  <div className={`next-section-message ${className || ''}`}>
    <div className="next-section-message-content">
      <span className="next-section-message-text">
        <FormattedMessage id={messageKey}>
          {(msg) => msg}
        </FormattedMessage>
      </span>
      <span className="next-section-title" dangerouslySetInnerHTML={{ __html: nextSection.title }} />
    </div>
    <Button
      className="next-section-button"
      variant='primary'
      size='large'
      onClick={onClick}
      data-analytics-label={analyticsLabel}
    >
      <FormattedMessage id='i18n:practice-questions:popup:continue'>
        {(msg) => msg}
      </FormattedMessage>
    </Button>
  </div>
);

export default NextSectionMessage;
