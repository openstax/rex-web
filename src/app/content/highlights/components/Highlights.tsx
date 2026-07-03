import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { useSelector } from 'react-redux';
import { typesetMath } from '../../../../helpers/mathjax';
import Loader from '../../../components/Loader';
import { useServices } from '../../../context/Services';
import { assertWindow } from '../../../utils';
import allImagesLoaded from '../../components/utils/allImagesLoaded';
import LoaderWrapper from '../../styles/LoaderWrapper';
import * as selectors from '../selectors';
import { HighlightsList, NoHighlightsAvailable, NoHighlightsInBook } from './HighlightsCards';
import { receiveReadyToPrintHighlights } from '../actions';

/**
 * Note on print styles:
 * This component previously had a Highlights.css file with print-specific margin overrides
 * for .highlight-wrapper elements. That file was removed because:
 * 1. The CSS selectors didn't match the actual DOM structure
 * 2. HighlightWrapper is a styled-component in SectionHighlights.tsx with its own @media print rules
 * 3. Any print style adjustments should be made in the HighlightWrapper styled-component directly
 */

const Highlights = ({ className = 'highlights-ordered' }) => {
  const orderedHighlights = useSelector(selectors.orderedSummaryHighlights);
  const isLoading = useSelector(selectors.summaryIsLoading);
  const totalCountsPerPage = useSelector(selectors.totalCountsPerPage);
  const readyToPrintHighlights = useSelector(selectors.readyToPrintHighlights);
  const container = React.useRef<HTMLElement>(null);
  const services = useServices();

  // Automatically trigger print when readyToPrintHighlights becomes true
  // after promiseCollector resolves in printHighlights hook
  React.useEffect(() => {
    if (readyToPrintHighlights) {
      assertWindow().print();
      services.dispatch(receiveReadyToPrintHighlights(false));
    }
  }, [readyToPrintHighlights, services]);

  React.useLayoutEffect(() => {
    if (container.current) {
      services.promiseCollector.add(allImagesLoaded(container.current));
      services.promiseCollector.add(typesetMath(container.current, assertWindow()));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderedHighlights]);

  if (!isLoading && (!totalCountsPerPage || Object.keys(totalCountsPerPage).length === 0)) {
    return <NoHighlightsInBook container={container} />;
  }

  if (!isLoading && orderedHighlights && orderedHighlights.length === 0) {
    return <NoHighlightsAvailable container={container} />;
  }

  return (
    <React.Fragment>
      {isLoading ? (
        <LoaderWrapper>
          <Loader large />
        </LoaderWrapper>
      ) : null}
      {orderedHighlights && (
        <HighlightsList container={container} className={className} orderedHighlights={orderedHighlights} />
      )}
    </React.Fragment>
  );
};

export default Highlights;
