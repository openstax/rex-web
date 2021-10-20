import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { useSelector } from 'react-redux';
import { practiceQuestionsEnabled } from '../../practiceQuestions/selectors';
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
  const isPracticeQuestionsEnabled = useSelector(practiceQuestionsEnabled);
  const sidebarRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar || typeof(window) === 'undefined') {
      return;
    }
    const {callback, deregister} = setSidebarHeight(sidebar, window);
    callback();

    return deregister;
  }, [sidebarRef]);

  return <Styled.ToolbarWrapper ref={sidebarRef} data-testid='toolbar' data-analytics-region='toolbar'>
    <OpenSidebarControl hideMobileText={true} />
    <PracticeQuestionsButton />
    <Styled.NudgeElementTarget id={nudgeStudyToolsTargetId}>
      <StudyGuidesButton />
      <HighlightButton />
    </Styled.NudgeElementTarget>
    {!isPracticeQuestionsEnabled ? <PrintButton /> : null}
  </Styled.ToolbarWrapper>;
};

export default Toolbar;
