import { TreeItem, TreeItemContent } from 'react-aria-components';
import styled, { css } from 'styled-components/macro';
import { CollapseIcon, ExpandIcon, iconSize } from '../../../../components/Details.legacy';
import { labelStyle } from '../../../../components/Typography';
import theme from '../../../../theme';
import { ArchiveTree } from '../../../types';
import ContentLinkComponent from '../../ContentLink';
import { Tree } from 'react-aria-components';
import getNumberWidth, { dividerWidth } from '../utils';

export { ExpandIcon, CollapseIcon } from '../../../../components/Details.legacy';

const activeState = css`
  color: ${theme.color.text.black};
  text-decoration: underline;
`;

export const SummaryTitle = styled.span`
  ${labelStyle}
  font-size: 1.6rem;
  line-height: 1.8rem;
  display: flex;
  flex: 1;
`;

export const ContentLink = styled(ContentLinkComponent)`
  ${labelStyle}
  font-size: 1.6rem;
  line-height: 1.8rem;
  display: flex;
  margin-left: ${iconSize}rem;
  text-decoration: none;

  &[aria-current="page"] {
    font-weight: 600;
  }

  :focus,
  :hover {
    outline: none;
    ${activeState}
  }
`;

export const NavItem = styled(TreeItemContent)`
  list-style: none;
  overflow: visible;
  margin: 1.2rem 0 0 0;
  ${theme.breakpoints.mobile(css`
    margin-top: 1.7rem;
  `)}
`;

export const SummaryWrapper = styled.div`
  display: flex;
  list-style: none;
  overflow: visible;
  ${/* suppress errors from https://github.com/stylelint/stylelint/issues/3391 */ css`
    :hover ${SummaryTitle},
    :focus ${SummaryTitle} {
      ${activeState}
    }
  `}

  ${theme.breakpoints.mobile(css`
    margin-top: 1.7rem;
  `)}
`;

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

      .os-number {
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
