import Color from 'color';
import styled, { css } from 'styled-components/macro';
import MainContent from '../../../components/MainContent';
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

  .MathJax_Display .highlight {
    display: inline-block;
  }

  ${highlightStyles.map((style) => css`
    .highlight.${style.label} {
      background-color: ${style.passive};

      @media screen {
        &.focus {
          background-color: ${style.focused};

          ${Color(style.focused).isDark() && css`
            color: ${theme.color.text.white};
          `}
        }
      }
    }
  `)}

  @media screen {
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

  #${MAIN_CONTENT_ID} * {
    overflow: initial; /* rex styles default to overflow hidden, breaks content */
  }
`;
