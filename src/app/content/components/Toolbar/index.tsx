import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import * as pqSelectors from '../../practiceQuestions/selectors';
import { searchInSidebar } from '../../search/selectors';
import { mobileMenuOpen } from '../../selectors';
import { setSidebarHeight } from '../../utils/domUtils';
import { nudgeStudyToolsTargetId } from '../NudgeStudyTools/constants';
import { NudgeElementTarget } from '../NudgeStudyTools/styles';
import {
  CloseSearchControl, CloseToCAndMobileMenuButton, CloseTOCControl, OpenSearchControl, OpenTOCControl
} from '../SidebarControl';
import HighlightButton from './HighlightButton';
import PracticeQuestionsButton from './PracticeQuestionsButton';
import PrintButton from './PrintButton';
import StudyGuidesButton from './StudyGuidesButton';
import { useMatchMobileQuery } from '../../../reactUtils';
import * as Styled from './styled';

// tslint:disable-next-line: variable-name
const VerticalNav = () => {
  const isMobileMenuOpen = useSelector(mobileMenuOpen);
  const isPracticeQuestionsEnabled = useSelector(pqSelectors.practiceQuestionsEnabled);
  const sidebarRef = React.useRef<HTMLElement>(null);
  const showSearchInSidebar = useSelector(searchInSidebar);
  const isMobile = useMatchMobileQuery();

  React.useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar || typeof(window) === 'undefined') {
      return;
    }
    const {callback, deregister} = setSidebarHeight(sidebar, window);
    callback();

    return deregister;
  }, [sidebarRef]);

  if (isMobile && !isMobileMenuOpen) {
    return null;
  }

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
      <CloseToCAndMobileMenuButton />
    </Styled.ToolbarMobileHeader>
    <Styled.ToolbarElements>
      <OpenTOCControl showActivatedState />
      <CloseTOCControl showActivatedState />
      {showSearchInSidebar ? <>
        <OpenSearchControl showActivatedState data-experiment />
        <CloseSearchControl showActivatedState data-experiment />
        <OpenSearchControl showActivatedState data-experiment desktop />
        <CloseSearchControl showActivatedState data-experiment desktop />
      </> : null}
      <PracticeQuestionsButton />
      <NudgeElementTarget id={nudgeStudyToolsTargetId}>
        <StudyGuidesButton />
        <HighlightButton />
      </NudgeElementTarget>
      {!isPracticeQuestionsEnabled ? <PrintButton /> : null}
    </Styled.ToolbarElements>
  </Styled.ToolbarWrapper>;
};

export default VerticalNav;
