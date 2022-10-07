import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import styled from 'styled-components/macro';
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
import Attribution from './Attribution';
import { contentTextWidth } from './constants';
import Page from './Page';
import { PrevNextBar } from './PrevNextBar';

// tslint:disable-next-line: variable-name
const StyledButton = styled(Button)`
  width: 100%;
  max-width: ${contentTextWidth}rem;
  margin: 0 auto;
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
  const {redirect} = useSelector(selectNavigation.query);
  const sections = useAssignedSections();
  const [currentSectionIndex, setCurrentSectionIndex] = React.useState(0);
  const prevNext = usePrevNext(sections);

  useLoadSection(sections[currentSectionIndex]);

  return <AccessibilityButtonsWrapper>
    <ErrorModal />
    <ErrorBoundary>
      <Page>
        {prevNext
          ? <PrevNextBar
            book={book}
            prevNext={prevNext}
            handlePrevious={() => setCurrentSectionIndex(Math.max(0, currentSectionIndex - 1))}
            handleNext={() => setCurrentSectionIndex(Math.min(sections.length - 1, currentSectionIndex + 1))}
          />
          : null
        }
        {!prevNext?.next && typeof redirect === 'string'
          ? (<FormattedMessage id='i18n:assigned:button:continue'>
              {(msg) => <StyledButton component={<a href={redirect}>{msg}</a>} variant='primary' size='large' />}
            </FormattedMessage>)
          : null
        }
      </Page>
      <Attribution />
    </ErrorBoundary>
  </AccessibilityButtonsWrapper>;
};
