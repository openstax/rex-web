import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import theme from '../../../theme';
import { assertNotNull } from '../../../utils';
import GoToTopButton from '../../components/GoToTopButton';
import { loadMoreDistanceFromBottom } from '../../highlights/constants';
import { PopupBody } from '../../styles/PopupStyles';
import { loadMoreStudyGuides } from '../actions';
import * as select from '../selectors';
import StudyGuides from './StudyGuides';

// tslint:disable-next-line:variable-name
export const StudyGuidesBody = styled(PopupBody)`
  background: ${theme.color.neutral.darker};
  ${theme.breakpoints.mobile(css`
    text-align: left;
    padding: 0;
  `)}

  @media print {
    background: white;
  }
`;

// tslint:disable-next-line: variable-name
const ShowStudyGuides = () => {
  const ref = React.useRef<HTMLElement>(null);
  const [showGoToTop, setShowGoToTop] = React.useState(false);
  const dispatch = useDispatch();
  const isLoading = useSelector(select.studyGuidesIsLoading);
  const hasMoreResults = useSelector(select.hasMoreResults);

  const goToTop = () => {
    assertNotNull(ref.current, 'Expected ref to be not null').scrollTop = 0;
    setShowGoToTop(false);
  };

  const fetchMoreHighlights = React.useCallback(() => {
    if (isLoading || !ref.current) { return; }
    const scrollBottom = ref.current.scrollHeight - ref.current.offsetHeight - ref.current.scrollTop;
    if (scrollBottom <= loadMoreDistanceFromBottom && hasMoreResults) {
      dispatch(loadMoreStudyGuides());
    }
  }, [ref, dispatch, isLoading, hasMoreResults]);

  React.useEffect(() => {
    const refElement = ref.current;
    if (refElement) {
      setShowGoToTop(refElement.scrollTop > 0);
      refElement.addEventListener('scroll', fetchMoreHighlights);
    }
    return () => refElement ? refElement.removeEventListener('scroll', fetchMoreHighlights) : undefined;
  }, [fetchMoreHighlights]);

  return (
    <StudyGuidesBody
      ref={ref}
      data-testid='show-studyguides-body'
      data-analytics-region='SG popup'
    >
      <StudyGuides />
      {showGoToTop && <GoToTopButton
        i18nAriaLabel='i18n:toolbar:studyguides:popup:button:back-to-top'
        onClick={goToTop}
        data-testid='back-to-top-studyguides'
      />}
    </StudyGuidesBody>
  );
};

export default ShowStudyGuides;
