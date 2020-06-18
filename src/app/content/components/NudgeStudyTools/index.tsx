import React from 'react';
import ReactDOM from 'react-dom';
import { useSelector } from 'react-redux';
import { useDebouncedMatchMobileQuery } from '../../../reactUtils';
import { assertDocument, assertNotNull } from '../../../utils';
import { showNudgeStudyTools } from '../../selectors';
import arrowDesktop from './assets/arrowDesktop.svg';
import arrowMobile from './assets/arrowMobile.svg';
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
import { useGetStudyToolsTarget, usePositions } from './utils';

// tslint:disable-next-line: variable-name
const NudgeStudyTools = () => {
  const document = assertDocument();
  const body = assertNotNull(document.querySelector('body'), 'body element is not defined');
  const isMobile = useDebouncedMatchMobileQuery();
  const show = useSelector(showNudgeStudyTools);
  const target = useGetStudyToolsTarget();
  const positions = usePositions(target, isMobile);

  React.useEffect(() => {
    if (show) {
      body.style.overflow = 'hidden';
    }
    return () => { body.style.overflow = 'visible'; };
  }, [body, show]);

  if (!show || !target || !positions) { return null; }

  return ReactDOM.createPortal(<React.Fragment>
    <NudgeArrow
      src={isMobile ? arrowMobile : arrowDesktop}
      alt=''
      top={positions.arrowTopOffset}
      left={positions.arrowLeft}
    />
    <NudgeCloseButton
      top={positions.closeButtonTopOffset}
      left={positions.closeButtonLeft}
    >
      <NudgeCloseIcon />
    </NudgeCloseButton>
    <NudgeContentWrapper
      top={positions.contentWrapperTopOffset}
      right={positions.contentWrapperRight}
    >
      <NudgeContent>
        <NudgeHeading />
        <NudgeText />
      </NudgeContent>
    </NudgeContentWrapper>
    <NudgeBackground>
      <NudgeSpotlight
        top={positions.spotlightTopOffset}
        left={positions.spotlightLeftOffset}
        height={positions.spotlightHeight}
        width={positions.spotlightWidth}
      />
    </NudgeBackground>
  </React.Fragment>,
  body
  );
};

export default NudgeStudyTools;
