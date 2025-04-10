import React from 'react';
import styled, { css } from 'styled-components/macro';
import { CollapseToggle } from '../../../../components/Details';
import { iconSize } from '../../../../components/Details';
import { labelStyle } from '../../../../components/Typography';
import theme from '../../../../theme';
import { ArchiveTree } from '../../../types';
import { splitTitleParts } from '../../../utils/archiveTreeUtils';
import ContentLinkComponent from '../../ContentLink';

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

  li[aria-label="Current Page"] & {
    font-weight: 600;
  }

  :focus,
  :hover {
    outline: none;
    ${activeState}
  }
`;

interface NavItemComponentProps {
  active?: boolean;
  className?: string;
  sectionType?: string;
}
// tslint:disable-next-line:variable-name
export const NavItemComponent = React.forwardRef<HTMLLIElement, NavItemComponentProps>(
  ({ active, className, children, sectionType }, ref) => <li
    data-type={sectionType}
    ref={ref}
    className={className}
    {...(active ? { 'aria-label': 'Current Page' } : {})}
    role='none'
  >{children}</li>
);

// tslint:disable-next-line:variable-name
export const NavItem = styled(NavItemComponent)`
  list-style: none;
  overflow: visible;
  margin: 1.2rem 0 0 0;
  ${theme.breakpoints.mobile(css`
    margin-top: 1.7rem;
  `)}

  a[role="treeitem"] {
    :focus,
    :hover {
      outline: none;
      ${activeState}
    }
  }
`;

// tslint:disable-next-line:variable-name

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

// tslint:disable-next-line:variable-name
export const NavOl = styled.ol<{ section: ArchiveTree }>`
  margin: 0;
  padding: 0;
  ${(props) => {
    const numberWidth = getNumberWidth(props.section.contents);

    return css`
      & > ${NavItem} > a {
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
      }

      & > ${NavItem} > ol {
        margin-left: ${numberWidth + dividerWidth}rem;
      }

      ${/* suppress errors from https://github.com/stylelint/stylelint/issues/3391 */ css`
        &:not([open]) {
          display: none;

          a[role='treeitem'] {
            display: none;
          }

        }
      `}
    `;
  }}
`;

interface CollapseComponentProps { open: boolean; visible: boolean; treeId: string | undefined; }
class CollapseComponent extends React.Component<CollapseComponentProps> {
  public render() {
    const { open, treeId, visible, ...props } = this.props;

    return <CollapseToggle role='treeitem' data-treeid={treeId} href='#' {...props} open={open} data-visible={visible} />;
  }
}

// tslint:disable-next-line:variable-name
export const NavCollapse = styled(CollapseComponent)`
  ${labelStyle}
  display: flex;
  overflow: visible;
  list-style: none;
  cursor: pointer;
  text-decoration: none;

  /* stylelint-disable no-descending-specificity */
  :focus,
  :hover {
    outline: none;
    ${activeState}
  }

  ::before {
    display: none;
  }

  ${/* suppress errors from https://github.com/stylelint/stylelint/issues/3391 */ css`
    :hover ${SummaryTitle},
    :focus ${SummaryTitle} {
      ${activeState}
    }
  `}
`;
