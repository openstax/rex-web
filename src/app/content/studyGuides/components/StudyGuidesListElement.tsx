import { Highlight } from '@openstax/highlighter/dist/api';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import ContentExcerpt from '../../components/ContentExcerpt';
import { highlightStyles } from '../../constants';
import { popupPadding } from '../../styles/PopupStyles';
import theme from '../../../theme';
import './StudyGuidesListElement.css';

function HighlightContentLabel({color}: {color: string}) {
  const assertedColor = ['blue', 'green', 'purple'].includes(color) ? color : 'yellow';
  return <div className="study-guides-list-element-hidden-label">
    <FormattedMessage id={`i18n:studyguides:popup:filters:${assertedColor}`} />
  </div>;
}

interface HighlightListElementProps {
  highlight: Highlight;
}

const HighlightListElement = ({ highlight }: HighlightListElementProps) => {
  // Find the highlight style for the dynamic border color
  const style = highlightStyles.find((search) => search.label === highlight.color);
  const highlightBorderColor = style?.passive || '';

  return (
    <div
      className="study-guides-list-element-outer"
      style={{
        '--popup-padding': `${popupPadding}rem`,
        '--bg-color': theme.color.neutral.base,
        '--border-color': theme.color.neutral.darker,
      } as React.CSSProperties}
    >
      {highlight.annotation && (
        <div
          className="study-guides-list-element-annotation"
          style={{
            '--text-color-default': theme.color.text.default,
            '--text-color-black': theme.color.text.black,
          } as React.CSSProperties}
        >
          {highlight.annotation}
        </div>
      )}
      <div
        className="study-guides-list-element-content"
        style={{
          '--highlight-border-color': highlightBorderColor,
        } as React.CSSProperties}
      >
        <HighlightContentLabel color={highlight.color} />
        <ContentExcerpt
          data-highlight-id={highlight.id}
          content={highlight.highlightedContent}
          source={highlight.sourceId}
        />
      </div>
    </div>
  );
};

export default HighlightListElement;
