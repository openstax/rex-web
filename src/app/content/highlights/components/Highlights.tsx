import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components/macro';
import { typesetMath } from '../../../../helpers/mathjax';
import Loader from '../../../components/Loader';
import { useServices } from '../../../context/Services';
import { assertWindow } from '../../../utils';
import { HighlightWrapper } from '../../components/SectionHighlights';
import allImagesLoaded from '../../components/utils/allImagesLoaded';
import LoaderWrapper from '../../styles/LoaderWrapper';
import * as selectors from '../selectors';
import { HighlightsList, NoHighlightsAvailable, NoHighlightsInBook } from './HighlightsCards';

// tslint:disable-next-line: variable-name
const Highlights = ({ className }: { className: string }) => {
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
    }
  }, [readyToPrintHighlights]);

  React.useLayoutEffect(() => {
    if (container.current) {
      services.promiseCollector.add(allImagesLoaded(container.current));
      services.promiseCollector.add(typesetMath(container.current, assertWindow()));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderedHighlights]);

  if (
    !isLoading
    && (!totalCountsPerPage || Object.keys(totalCountsPerPage).length === 0)
  ) {
    return <NoHighlightsInBook container={container} />;
  }

  if (!isLoading && orderedHighlights && orderedHighlights.length === 0) {
    return <NoHighlightsAvailable container={container} />;
  }

  return (
    <React.Fragment>
      {isLoading ? <LoaderWrapper><Loader large /></LoaderWrapper> : null}
      {orderedHighlights &&
        <HighlightsList container={container} className={className} orderedHighlights={orderedHighlights} />
      }
    </React.Fragment>
  );
};

export default styled(Highlights)`
  @media print {
    ${HighlightWrapper} {
      margin: 0;
    }
  }
`;
