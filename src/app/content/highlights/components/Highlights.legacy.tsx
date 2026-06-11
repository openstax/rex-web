/**
 * Legacy styled-components wrapper for Highlights
 *
 * This file provides a backward-compatible styled-component wrapper around
 * the new plain React implementation. The wrapper is needed because:
 * 1. It adds print-specific styles using component selectors
 * 2. HighlightWrapper from SectionHighlights is still a styled component
 *
 * Once SectionHighlights is migrated to plain CSS, this wrapper can be
 * removed and the print styles can move to a plain CSS file.
 */

import styled from 'styled-components/macro';
import { HighlightWrapper } from '../../components/SectionHighlights';
import HighlightsComponent from './Highlights.new';

export default styled(HighlightsComponent)`
  @media print {
    ${HighlightWrapper} {
      margin: 0;
    }
  }
`;
