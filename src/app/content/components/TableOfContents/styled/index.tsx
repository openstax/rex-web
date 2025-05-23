import { TreeItem, TreeItemContent } from 'react-aria-components';
import styled, { css } from 'styled-components/macro';
import { CollapseIcon, ExpandIcon } from '../../../../components/Details';
import { iconSize } from '../../../../components/Details';
import { labelStyle } from '../../../../components/Typography';
import theme from '../../../../theme';
import { ArchiveTree } from '../../../types';
import { splitTitleParts } from '../../../utils/archiveTreeUtils';
import ContentLinkComponent from '../../ContentLink';
import { Tree } from 'react-aria-components';

export { ExpandIcon, CollapseIcon } from '../../../../components/Details';

/* to regenerate these numbers, run this in a rex browser window
(
  (element) => 'wW1234567890.'.split('').reduce(
    (result, char) => (result[char] = ((element.innerText = char) && element.getBoundingClientRect().width)) && result,
    {}
  )
)(element = document.querySelector('[data-testid=toc] [aria-label="Current Page"] a')
  .appendChild(document.createElement('span'))
);
 */
const numberCharacterWidth = .890625;
const letterCharacterWidth = 1.5109375;
const numberPeriodWidth = .4453125;
const dividerWidth = .8;

const activeState = css`
  color: ${theme.color.text.black};
  text-decoration: underline;
`;

// tslint:disable-next-line:variable-name
export const SummaryTitle = styled.span`
  ${labelStyle}
  font-size: 1.6rem;
  line-height: 1.8rem;
  display: flex;
  flex: 1;
`;

// tslint:disable-next-line:variable-name
export const ContentLink = styled(ContentLinkComponent)`
  ${labelStyle}
  font-size: 1.6rem;
  line-height: 1.8rem;
  display: flex;
  margin-left: ${iconSize}rem;
  text-decoration: none;

  &[aria-label$="Current Page"] {
    font-weight: 600;
  }

  :focus,
  :hover {
    outline: none;
    ${activeState}
  }
`;

// tslint:disable-next-line:variable-name
export const NavItem = styled(TreeItemContent)`
  list-style: none;
  overflow: visible;
  margin: 1.2rem 0 0 0;
  ${theme.breakpoints.mobile(css`
    margin-top: 1.7rem;
  `)}
`;

// tslint:disable-next-line:variable-name
export const SummaryWrapper = styled.div`
  display: flex;
  list-style: none;
  overflow: visible;

  :hover ${SummaryTitle},
  :focus ${SummaryTitle} {
    ${activeState}
  }

  ${theme.breakpoints.mobile(css`
    margin-top: 1.7rem;
  `)}
`;

const getNumberWidth = (contents: ArchiveTree['contents']) => contents.reduce((result, { title }) => {
  const num = splitTitleParts(title)[0];

  if (!num) {
    return result;
  }
  const letters = num.replace(/[^A-Z]/ig, '');
  const numbers = num.replace(/[^0-9]/g, '');
  const periods = num.replace(/[^.]/g, '');

  return Math.max(result,
    numbers.length * numberCharacterWidth +
    letters.length * letterCharacterWidth +
    periods.length * numberPeriodWidth
  );
}, 0);

export const StyledTree = styled(Tree)``;

export const StyledTreeItemContent = styled(TreeItemContent)``;

export const StyledTreeItem = styled(TreeItem)<{ section: ArchiveTree }>`
  margin: 0;

  > div > div {
    padding-left: calc((var(--tree-item-level) - 1) * 2rem);
  }

  > div > a {
    padding-left: calc((var(--tree-item-level) - 1) * 2.6rem);
  }

  &[data-expanded] > div ${ExpandIcon} {
    display: none;
  }

  &:not([data-expanded]) > div ${CollapseIcon} {
    display: none;
  }

  ${(props) => {
    const numberWidth = getNumberWidth(props.section.contents);

    return css`
      margin-top: 1.2rem;
      margin-left: ${numberWidth + dividerWidth}rem;
      
      .os-number {P
          width: ${numberWidth}rem;
          overflow: hidden;
        }

        .os-divider {
          width: ${dividerWidth}rem;
          text-align: center;
          overflow: hidden;
        }

        .os-text {
          flex: 1;
          overflow: hidden;
        }
    `;
  }}
`;
