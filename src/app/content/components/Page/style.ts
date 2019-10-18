import { css } from 'styled-components/macro';
import { bodyCopyRegularStyle } from '../../../components/Typography';
import { MAIN_CONTENT_ID } from '../../../context/constants';
import theme from '../../../theme';
import { highlightStyles } from '../../highlights/constants';
import { contentTextWidth } from '../constants';

export const contentTextStyle = css`
  ${bodyCopyRegularStyle}

  @media screen { /* full page width in print */
    max-width: ${contentTextWidth}rem;
    margin: 0 auto;
  }
`;

export default css`
  ${contentTextStyle}

  @media screen { /* full page width in print */
    flex: 1;
    display: flex;
    width: 100%;

    > #${MAIN_CONTENT_ID} {
      width: 100%;
    }

    /* trying to add margin to a page wrapper that
     * will collapse with the margin of the top element in the
     * page. can't add it to the page element because it is flexy,
     * or the main_content because page makes it flexy. those
     * need to be flexy to center the loading indicator
     */
    > #${MAIN_CONTENT_ID} > [data-type="page"],
    > #${MAIN_CONTENT_ID} > [data-type="composite-page"] {
      margin-top: ${theme.padding.page.desktop}rem;
      ${theme.breakpoints.mobile(css`
        margin-top: ${theme.padding.page.mobile}rem;
      `)}
    }
  }

  overflow: visible; /* allow some elements, like images, videos, to overflow and be larger than the text. */

  @media screen {
    ${highlightStyles.map((style) => css`
      .highlight.${style.label} {
        background-color: ${style.passive};
      }
    `)}

    .search-highlight {
      font-weight: bold;
      background-color: #ffd17e;

      &.focus {
        background-color: #ff9e4b;

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

  * {
    overflow: initial; /* rex styles default to overflow hidden, breaks content */
  }
`;
