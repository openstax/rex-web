import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import GoToTopButton from '../../../components/GoToTopButton';
import theme from '../../../theme';
import { assertNotNull } from '../../../utils';
import FiltersList from '../../components/popUp/FiltersList';
import { loadMoreDistanceFromBottom } from '../../constants';
import { PopupBody } from '../../styles/PopupStyles';
import { loadMoreStudyGuides } from '../actions';
import * as select from '../selectors';
import Filters from './Filters';
import StudyGuides from './StudyGuides';
import StudyGuidesCTA from './StudyGuidesCTA';

// tslint:disable-next-line:variable-name
export const StudyGuidesBody = styled(PopupBody)`
  background: ${theme.color.neutral.darker};
  ${theme.breakpoints.mobile(css`
    text-align: left;
    padding: 0;
  `)}

  @media print {
    background: white;

    ${FiltersList} {
      padding-left: 0;
    }
  }
`;

// tslint:disable-next-line: variable-name
const ShowStudyGuides = () => {
  const ref = React.useRef<HTMLElement>(null);
  const [showGoToTop, setShowGoToTop] = React.useState(false);
  const dispatch = useDispatch();
  const isLoading = useSelector(select.summaryIsLoading);
  const hasMoreResults = useSelector(select.hasMoreResults);

  const goToTop = () => {
    assertNotNull(ref.current, 'Expected ref to be not null').scrollTop = 0;
    setShowGoToTop(false);
  };

  React.useEffect(() => {
    const refElement = ref.current;
    if (!refElement) { return; }

    const scrollHandler = () => setShowGoToTop(refElement.scrollTop > 0);

    refElement.addEventListener('scroll', scrollHandler);
    return () => refElement.removeEventListener('scroll', scrollHandler);
  }, [setShowGoToTop]);

  React.useEffect(() => {
    const refElement = ref.current;
    if (!refElement || isLoading) { return; }

    const scrollHandler = () => {
      const scrollBottom = refElement.scrollHeight - refElement.offsetHeight - refElement.scrollTop;
      if (scrollBottom <= loadMoreDistanceFromBottom && hasMoreResults) {
        dispatch(loadMoreStudyGuides());
      }
    };

    refElement.addEventListener('scroll', scrollHandler);
    return () => refElement.removeEventListener('scroll', scrollHandler);
  }, [isLoading, hasMoreResults, dispatch]);

  return (
    <StudyGuidesBody
      ref={ref}
      data-testid='show-studyguides-body'
      data-analytics-region='SG popup'
    >
      <StudyGuidesCTA />
      <Filters />
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
