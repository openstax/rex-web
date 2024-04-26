import Color from 'color';
import styled, { css } from 'styled-components/macro';
import MainContent from '../../../components/MainContent';
import { MAIN_CONTENT_ID } from '../../../context/constants';
import theme, { screenreaderOnly } from '../../../theme';
import { highlightStyles } from '../../constants';
import {
  highlightBlockPadding,
  highlightIndicatorSize,
  highlightIndicatorSizeForBlock,
} from '../../highlights/constants';
import { contentTextWidth } from '../constants';

export const contentTextStyle = css`
  @media screen { /* full page width in print */
    max-width: ${contentTextWidth}rem;
    margin: 0 auto;
  }
`;

// Search and key term highlights need to target .math as well,
// otherwise math elements won't have full height background color
const SELF_AND_CHILD_MATH_SELECTOR = '&, & .math';

export default styled(MainContent)`
  ${contentTextStyle}
  overflow: visible;

  @media screen {
    flex: 1;
    display: flex;
    width: 100%;

    #${MAIN_CONTENT_ID} {
      overflow: visible;
      width: 100%;
    }

    /* trying to add margin to a page wrapper that
     * will collapse with the margin of the top element in the
     * page. can't add it to the page element because it is flexy,
     * or the main_content because page makes it flexy. those
     * need to be flexy to center the loading indicator
     */
    #${MAIN_CONTENT_ID} > [data-type="page"],
    #${MAIN_CONTENT_ID} > [data-type="composite-page"] {
      margin-top: ${theme.padding.page.desktop}rem;
      ${theme.breakpoints.mobile(css`
        margin-top: ${theme.padding.page.mobile}rem;
      `)}
    }
  }

  .highlight {
    position: relative;
    z-index: 1;

    @media screen {
      &[data-start-message]::before,
      &[data-end-message]::after {
        ${screenreaderOnly}
      }

      &.first[data-start-message]::before {
        content: attr(data-start-message);
      }

      &.last[data-end-message]::after {
        content: attr(data-end-message);
      }
    }
  }

  /* stylelint-disable selector-class-pattern */
  .MathJax_Display .highlight,
  .MathJax_Preview + .highlight {
    display: inline-block;
  }
  /* stylelint-enable selector-class-pattern */

  ${highlightStyles.map((style) => css`
    .highlight.${style.label} {
      background-color: ${style.passive};

      &.block {
        display: block;

        &:after {
          position: absolute;
          z-index: -1;
          content: "";
          display: block;
          top: -1rem;
          bottom: -1rem;
          left: -1rem;
          right: -1rem;
          background-color: ${style.passive};
        }

        &.first.has-note:before {
          position: absolute;
          top: -${highlightBlockPadding}rem;
          left: -${highlightBlockPadding}rem;
          content: "";
          width: 0;
          height: 0;
          opacity: 0.8;
          border-left: ${highlightIndicatorSizeForBlock}em solid ${style.focused};
          border-bottom: ${highlightIndicatorSizeForBlock}em solid transparent;
        }
      }

      &.first.text.has-note {
        &:not(.last)::before {
          content: "";
        }

        ::before {
          position: absolute;
          top: 0;
          left: 0;
          clip-path: initial;
          clip: initial;
          opacity: 0.8;
          border-left: ${highlightIndicatorSize}em solid ${style.focused};
          border-bottom: ${highlightIndicatorSize}em solid transparent;
        }
      }

      @media screen {
        &[aria-current] {
          background-color: ${style.focused};
          border-bottom: 0.2rem solid ${style.focusBorder};
          padding: 0.2rem 0 0;

          ${Color(style.focused).isDark() && css`
            color: ${theme.color.text.white};
          `}

          &.block:after {
            background-color: ${style.focused};
          }

          &.first.text.has-note:after {
            display: none;
          }
        }
      }
    }
  `)}

  @media screen {
    .search-highlight {
      font-weight: bold;

      ${SELF_AND_CHILD_MATH_SELECTOR} {
        background-color: #ffea00;
      }

      &[aria-current] {
        ${SELF_AND_CHILD_MATH_SELECTOR} {
          background-color: #ff9e4b;
          padding: 0.2rem 0;
        }

        .search-highlight {
          background-color: unset;
        }
      }
    }
  }

  .os-figure,
  .os-figure:last-child {
    margin-bottom: 5px; /* fix double scrollbar bug */
  }

  #${MAIN_CONTENT_ID} * {
    overflow: initial; /* rex styles default to overflow hidden, breaks content */
  }
`;
