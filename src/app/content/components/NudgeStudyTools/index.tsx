import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import ReactDOM from 'react-dom';
import { useSelector } from 'react-redux';
import { assertDocument, remsToPx } from '../../../utils';
import { studyGuidesSummaryIsNotEmpty } from '../../studyGuides/selectors';
import { toolbarButtonMargin } from '../constants';
import { spotlightPadding } from './constants';
import {
  NudgeArrow,
  NudgeBackground,
  NudgeCloseButton,
  NudgeCloseIcon,
  NudgeContent,
  NudgeContentWrapper,
  NudgeHeading,
  NudgeSpotlight,
  NudgeText,
} from './styles';

// tslint:disable-next-line: variable-name
const NudgeStudyTools = () => {
  const document = assertDocument();
  const body = document.querySelector('body');
  const [target, setTarget] = React.useState<HTMLElement | null>(null);
  const studyGuides = useSelector(studyGuidesSummaryIsNotEmpty);

  React.useEffect(() => {
    if (studyGuides) {
      setTarget(document.querySelector('#nudge-study-tools') as HTMLElement | null);
    }
    return () => setTarget(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studyGuides]);

  if (!studyGuides || !body || !target) { return null; }

  const { top, left, height, width } = target.getBoundingClientRect();
  const padding = remsToPx(spotlightPadding);
  const spotlightTopOffset = top - padding;
  const spotlightLeftOffset = left - padding;
  const spotlightHeight = height + (padding * 2);
  const spotlightWidth = width + (padding * 2) - remsToPx(toolbarButtonMargin);
  const contentWrapperTopOffset = spotlightTopOffset + 100;

  return ReactDOM.createPortal(<React.Fragment>
    <NudgeContentWrapper top={contentWrapperTopOffset}>
      <NudgeContent>
        <NudgeArrow isMobile={false} />
        <NudgeHeading />
        <NudgeText />
        <NudgeCloseButton>
          <NudgeCloseIcon />
        </NudgeCloseButton>
      </NudgeContent>
    </NudgeContentWrapper>
    <NudgeBackground>
      <NudgeSpotlight
        top={spotlightTopOffset}
        left={spotlightLeftOffset}
        height={spotlightHeight}
        width={spotlightWidth}
      />
    </NudgeBackground>
  </React.Fragment>,
  body
  );
};

export default NudgeStudyTools;
