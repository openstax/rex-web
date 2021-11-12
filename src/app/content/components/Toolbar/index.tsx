import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { closeMobileMenu } from '../../actions';
import * as pqSelectors from '../../practiceQuestions/selectors';
import { mobileMenuOpen, tocOpen } from '../../selectors';
import { setSidebarHeight } from '../../utils/domUtils';
import { nudgeStudyToolsTargetId } from '../NudgeStudyTools/constants';
import { OpenSidebarControl } from '../SidebarControl';
import HighlightButton from './HighlightButton';
import PracticeQuestionsButton from './PracticeQuestionsButton';
import PrintButton from './PrintButton';
import StudyGuidesButton from './StudyGuidesButton';
import * as Styled from './styled';

// tslint:disable-next-line: variable-name
const Toolbar =   () => {
  const isMobileMenuOpen = useSelector(mobileMenuOpen);
  const isTocOpen = useSelector(tocOpen);
  const isPracticeQuestionsEnabled = useSelector(pqSelectors.practiceQuestionsEnabled);
  const sidebarRef = React.useRef<HTMLElement>(null);
  const dispatch = useDispatch();

  React.useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar || typeof(window) === 'undefined') {
      return;
    }
    const {callback, deregister} = setSidebarHeight(sidebar, window);
    callback();

    return deregister;
  }, [sidebarRef]);

  return <Styled.ToolbarWrapper
    isMobileMenuOpen={isMobileMenuOpen}
    ref={sidebarRef}
    data-testid='toolbar'
    data-analytics-region='toolbar'
  >
    <Styled.ToolbarMobileHeader>
      <Styled.ToolbarMobileHeaderTitle>
        <FormattedMessage id='i18n:toolbar:header:title'>
          {(msg) => msg}
        </FormattedMessage>
      </Styled.ToolbarMobileHeaderTitle>
      <Styled.CloseToolbarButton onClick={() => dispatch(closeMobileMenu())}>
        <Styled.TimesIcon />
      </Styled.CloseToolbarButton>
    </Styled.ToolbarMobileHeader>
    <OpenSidebarControl isActive={isTocOpen !== false} hideMobileText={false} />
    <PracticeQuestionsButton />
    <Styled.NudgeElementTarget id={nudgeStudyToolsTargetId}>
      <StudyGuidesButton />
      <HighlightButton />
    </Styled.NudgeElementTarget>
    {!isPracticeQuestionsEnabled ? <PrintButton /> : null}
  </Styled.ToolbarWrapper>;
};

export default Toolbar;
