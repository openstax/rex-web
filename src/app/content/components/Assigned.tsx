import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import AccessibilityButtonsWrapper from '../../components/AccessibilityButtonsWrapper';
import Button from '../../components/Button';
import { useServices } from '../../context/Services';
import ErrorBoundary from '../../errors/components/ErrorBoundary';
import ErrorModal from '../../errors/components/ErrorModal';
import { or } from '../../fpUtils';
import * as selectNavigation from '../../navigation/selectors';
import { assertString } from '../../utils/assertions';
import { loadPage } from '../hooks/locationChange/resolveContent';
import * as selectContent from '../selectors';
import { ArchiveTreeSection, LinkedArchiveTreeSection } from '../types';
import { findTreePages, getPrevNext, nodeMatcher } from '../utils/archiveTreeUtils';
import { stripIdVersion } from '../utils/idUtils';
import { AssignedTopBar } from './AssignedTopBar';
import Attribution from './Attribution';
import { contentTextWidth } from './constants';
import Page from './Page';
import { PrevNextBar } from './PrevNextBar';
import { getMobileSearchFailureTop } from './Page/PageToasts';
import theme from '../../theme';
import PageToasts from './Page/PageToasts';
import {
  topbarDesktopHeight,
  bookBannerMobileMiniHeight,
} from './constants';

const StyledButton = styled(Button)`
  width: 100%;
  max-width: ${contentTextWidth}rem;
  margin: 0 auto;
`;

// Override layout for Toast
const assignedMobileTop = (props: {mobileToolbarOpen: boolean}) =>
  getMobileSearchFailureTop(props) - bookBannerMobileMiniHeight;
const ToastOverride = styled(PageToasts)`
  top: ${topbarDesktopHeight}rem;
  left: 0;
  max-width: 100%;
  ${theme.breakpoints.mobile(css`
    top: ${assignedMobileTop}rem;
  `)}
`;

// tslint:disable-next-line: variable-name
const PlatformWrapper = styled.div<{ platform: string }>`
  [data-platform-hidden="${props => props.platform}"] {
    display: none;
  }
`;

const useLoadSection = (currentSection: ArchiveTreeSection | undefined) => {
  const services = useServices();
  const book = useSelector(selectContent.book);

  React.useEffect(() => {
    if (!book || !currentSection) {
      return;
    }
    const uuid = stripIdVersion(currentSection.id);
    loadPage(services, {uuid}, book, services.archiveLoader.forBook(book), uuid);
  }, [services, currentSection, book]);
};

const useAssignedSections = () => {
  const book = useSelector(selectContent.book);
  const query = useSelector(selectNavigation.query);
  const sections = React.useMemo(() => query.section instanceof Array
    ? query.section
    : [assertString(query.section, 'at least one section must be assigned')]
  , [query]);

  return React.useMemo(() => {
    if (!book) {
      return [];
    }
    const allPages = findTreePages(book.tree);

    return allPages.filter(or(...sections.map(nodeMatcher)));
  }, [book, sections]);
};

const usePrevNext = (sections: LinkedArchiveTreeSection[]) => {
  const page = useSelector(selectContent.page);

  return React.useMemo(() => {
    if (!page) {
      return;
    }
    const prevNext = getPrevNext(sections, page.id);

    if (!prevNext.prev && !prevNext.next) {
      return undefined;
    }

    return prevNext;
  }, [sections, page]);
};

export default () => {
  const book = useSelector(selectContent.book);
  const {return_url} = useSelector(selectNavigation.query);
  const sections = useAssignedSections();
  const [currentSectionIndex, setCurrentSectionIndex] = React.useState(0);
  const prevNext = usePrevNext(sections);
  const section = sections[currentSectionIndex];

  useLoadSection(section);

  return <PlatformWrapper platform="assignable">
    <AccessibilityButtonsWrapper>
      <ErrorModal />
      <ErrorBoundary>
        <AssignedTopBar section={section} />
        <Page topHeadingLevel={2} lockNavigation={true} ToastOverride={ToastOverride}>
          {prevNext
            ? <PrevNextBar
              book={book}
              prevNext={prevNext}
              handlePrevious={() => setCurrentSectionIndex(Math.max(0, currentSectionIndex - 1))}
              handleNext={() => setCurrentSectionIndex(Math.min(sections.length - 1, currentSectionIndex + 1))}
            />
            : null
          }
          {!prevNext?.next && typeof return_url === 'string'
            ? (<FormattedMessage id='i18n:assigned:button:continue'>
                {(msg) => <StyledButton component={<a href={return_url}>{msg}</a>} variant='primary' size='large' />}
              </FormattedMessage>)
            : null
          }
        </Page>
        <Attribution />
      </ErrorBoundary>
    </AccessibilityButtonsWrapper>
  </PlatformWrapper>;
};
