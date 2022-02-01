import React from 'react';
import { FlattenSimpleInterpolation } from 'styled-components';
import styled, { css, keyframes } from 'styled-components/macro';
import { Details as BaseDetails, Summary } from '../../../../components/Details';
import { navDesktopHeight } from '../../../../components/NavBar';
import Times from '../../../../components/Times';
import {
  labelStyle,
  textRegularStyle,
  textStyle
} from '../../../../components/Typography';
import theme from '../../../../theme';
import {
    bookBannerDesktopMiniHeight,
    bookBannerMobileMiniHeight,
    searchResultsBarDesktopWidth,
    searchSidebarTopOffset,
    sidebarTransitionTime,
    toolbarDesktopHeight,
    toolbarIconColor,
    toolbarMobileHeight,
  } from '../../../components/constants';
import ContentLinkComponent from '../../../components/ContentLink';
import { toolbarIconStyles } from '../../../components/Toolbar/iconStyles';
import { disablePrint } from '../../../components/utils/disablePrint';

const borderColor = 'rgba(0, 0, 0, 0.06)';
const backgroundColor = '#fafafa';
const headerHeight = 4;

// tslint:disable-next-line:variable-name
export const SearchIconInsideBar = styled.img`
  ${toolbarIconStyles}
  height: ${headerHeight}rem;
  color: ${theme.color.primary.gray.darker};
  margin-right: 0.7rem;
  margin-left: 1.6rem;
  ${theme.breakpoints.mobile(css`
    margin-left: ${theme.padding.page.mobile}rem;
  `)}
`;

// tslint:disable-next-line:variable-name
export const CloseIcon = styled((props) => <Times {...props} aria-hidden='true' focusable='false' />)`
  color: ${toolbarIconColor.lighter};

  :hover {
    color: ${toolbarIconColor.base};
  }
`;

// tslint:disable-next-line:variable-name
export const NavWrapper = styled.div``;

// tslint:disable-next-line:variable-name
export const SearchResultsOl = styled.ol`
  list-style: none;
  padding: 0;
  margin: 0;

  .os-divider {
    width: 0.4rem;
  }
`;

const sidebarOpenAnimation = keyframes`
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(100%);
  }
`;

const sidebarHideAnimation = keyframes`
  0% {
    transform: translateX(100%);
  }

  99% {
    transform: translateX(0);
  }

  100% {
    visibility: hidden;
    transform: translateX(0);
  }
`;

export const styleWhenSearchClosed = (closedStyle: FlattenSimpleInterpolation) => css`
  ${(props: {searchResultsOpen: boolean}) => !props.searchResultsOpen && theme.breakpoints.mobile(closedStyle)}
  ${(props: {searchResultsOpen: boolean, hasQuery: boolean}) =>
    !props.searchResultsOpen && !props.hasQuery && closedStyle
  }
`;

// tslint:disable-next-line:variable-name
export const SearchResultsBar = styled.div`
  -webkit-overflow-scrolling: touch;
  overflow-x: visible;
  top: ${bookBannerDesktopMiniHeight + toolbarDesktopHeight}rem;
  margin-top: 0;
  padding: 0;
  position: sticky;
  width: ${searchResultsBarDesktopWidth}rem;
  background-color: ${backgroundColor};
  box-shadow: 0.2rem 0 0.2rem 0 rgba(0, 0, 0, 0.1);
  z-index: ${theme.zIndex.searchSidebar};
  height: calc(100vh - ${navDesktopHeight + bookBannerDesktopMiniHeight + toolbarDesktopHeight}rem);
  max-height: calc(100vh - ${bookBannerDesktopMiniHeight + toolbarDesktopHeight}rem);
  margin-left: -${searchResultsBarDesktopWidth}rem;
  animation: ${sidebarOpenAnimation} ${sidebarTransitionTime}ms forwards;
  ${styleWhenSearchClosed(css`
    animation: ${sidebarHideAnimation} ${sidebarTransitionTime}ms forwards;
  `)}
  ${theme.breakpoints.mobile(css`
    margin-left: -100%;
    width: 100%;
    margin-top: 0;
    top: ${searchSidebarTopOffset}rem;
    padding: 0;
    max-height: calc(100vh - ${bookBannerMobileMiniHeight + toolbarMobileHeight}rem);
  `)}

  > ${NavWrapper} {
    flex: 1;
    ::before {
      display: none;
    }

    margin: 0;
    padding: 0;
  }

  ${disablePrint}

  display: flex;
  flex-direction: column;
`;

// tslint:disable-next-line: variable-name
export const SearchResultsTopBar = styled.div`
  display: flex;
  flex-direction: column;
`;

// tslint:disable-next-line: variable-name
export const SearchResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${theme.color.neutral.formBorder}
`;

// tslint:disable-next-line: variable-name
export const SearchResultsHeaderTitle = styled.span`
  font-size: 1.8rem;
  margin-left: 16px;
  padding: 1rem 0;
  color: ${theme.color.primary.gray.base};
  font-weight: bold;
`;

// tslint:disable-next-line:variable-name
export const SearchQuery = styled.div`
  ${textRegularStyle}
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
  line-height: 1.3;

  strong {
    padding-left: 0.4rem;
  }
`;

// tslint:disable-next-line:variable-name
export const SearchQueryWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  background: ${backgroundColor};
  min-height: ${headerHeight}rem;
  overflow: visible;
`;

// tslint:disable-next-line:variable-name
export const SummaryTitle = styled.span`
  ${labelStyle}
  font-weight: bold;
  padding-right: 1.6rem;
  line-height: 1.3;
`;

// tslint:disable-next-line:variable-name
export const Details = styled(BaseDetails)`
  overflow: visible;
`;

// tslint:disable-next-line:variable-name
export const SearchBarSummaryContainer = styled.div`
  display: flex;
  align-items: normal;
  background: rgba(0, 0, 0, 0.17);
  padding: 1rem 0 1rem 1.6rem;
  border-top: solid 0.1rem ${borderColor};
  ${theme.breakpoints.mobile(css`
    padding-left: ${theme.padding.page.mobile}rem;

    ${SummaryTitle} {
      padding-right: ${theme.padding.page.mobile}rem;
    }
  `)}
`;

// tslint:disable-next-line:variable-name
export const SearchBarSummary = styled(Summary)`
  min-height: 3.8rem;

  > * {
    outline: none;
  }
`;

// tslint:disable-next-line:variable-name
export const SearchResultsLink = styled.div`
  ${labelStyle}
  width: 100%;
  font-weight: 700;
  line-height: 1.3;
`;

interface SectionContentPreviewProps extends React.ComponentProps<typeof ContentLinkComponent > {
  selectedResult: boolean;
}

// tslint:disable-next-line:variable-name
export const SectionContentPreview = styled(
  React.forwardRef<HTMLAnchorElement, SectionContentPreviewProps>(
    ({selectedResult, ...props}, ref) => <ContentLinkComponent {...props} ref={ref} />
  )
)`
  ${labelStyle}
  cursor: pointer;
  min-height: 3.7rem;
  align-items: center;
  display: block;
  text-decoration: none;
  line-height: 1.3;

  ${(props: {selectedResult: boolean}) => props.selectedResult && css`
    background: ${borderColor};
  `}

  > * {
    outline: none;
  }
`;

// tslint:disable-next-line:variable-name
export const LinkWrapper = styled.div`
  min-height: 3.4rem;
  display: flex;
  align-items: center;
  padding: 1.2rem 1.6rem 0.8rem 1.6rem;
  border-top: solid 0.2rem ${borderColor};
  ${theme.breakpoints.mobile(css`
    padding-left: 3.3rem;
  `)}
`;

// tslint:disable-next-line:variable-name
export const DetailsOl = styled.ol`
  overflow: visible;
  padding: 0;

  ${LinkWrapper}{
    padding-left: 2.5rem;
  }
`;

// tslint:disable-next-line:variable-name
export const NavItem = styled.li`
  overflow: visible;
  background: ${backgroundColor};
`;

// tslint:disable-next-line:variable-name
export const SearchQueryAlignment = styled.div`
  max-width: 26.5rem;
  text-align: center;
  margin-top: 7rem;
  margin-left: auto;
  margin-right: auto;
`;

// tslint:disable-next-line:variable-name
export const CloseIconButton = styled.button`
  ${toolbarIconStyles}
  cursor: pointer;
  border: none;
  padding: 0;
  margin: 0.3rem; /* some space to show focus outline */
  background: transparent;
  overflow: visible;
  height: ${headerHeight - 0.3}rem;
  width: ${headerHeight - 0.3}rem;
  ${theme.breakpoints.mobile(css`
    display: none;
  `)}
`;

// tslint:disable-next-line:variable-name
export const CloseIconWrapper = styled.div`
  overflow: visible;
  display: flex;
  justify-content: flex-end;
  margin: 1.4rem 1.4rem 0 0;
  ${theme.breakpoints.mobile(css`
    display: none;
  `)}

  ${CloseIconButton} {
    margin: 0;
  }
`;

// tslint:disable-next-line:variable-name
export const LoadingWrapper = styled.div`
  overflow: hidden;
  right: 0;
  top: 0;
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: ${backgroundColor};
  transition: opacity 0.5s 0.3s, transform 0.2s 0.2s;
`;

// tslint:disable-next-line:variable-name
export const HeaderQuery = styled.div`
  flex: 1;
  padding: 1rem 0;
  align-self: center;
`;

// tslint:disable-next-line:variable-name
export const ListItem = styled.li`
  overflow: visible;
  display: block;
`;

// tslint:disable-next-line: variable-name
export const SearchResultsSectionTitle = styled.span`
  ${textStyle}
  font-size: 1.8rem;
  font-weight: bold;
  display: flex;
  padding: 1.2rem 3.2rem;
`;

// tslint:disable-next-line: variable-name
export const KeyTermContainer = styled.div``;

// tslint:disable-next-line: variable-name
export const RelatedKeyTerms = styled.div`
  background-color: ${theme.color.white};

  ${SectionContentPreview} {
    padding-right: 2.4rem;
  }
`;

// tslint:disable-next-line: variable-name
export const KeyTerm = styled.span`
  display: block;
  font-weight: bold;
`;

// tslint:disable-next-line: variable-name
export const SimpleResult = styled.div`
  margin: 0 0 0 3.2rem;
  padding: 1.2rem ${theme.padding.page.mobile}rem 1.2rem 0;

  ${theme.breakpoints.mobile(css`
    margin-left: 5rem;
  `)}

  ${SectionContentPreview}:not(:last-child) > & {
    border-bottom: solid 0.1rem ${borderColor};
  }

  > div {
    ::before{
      content: '... '
    }

    ::after {
      content: ' ...'
    }
  }
`;

// tslint:disable-next-line: variable-name
export const KeyTermResult = styled(SimpleResult)`
  ${theme.breakpoints.mobile(css`
    margin-left: 3.2rem;
  `)}

  > div {
    ::before{
      content: ''
    }

    ::after {
      content: ''
    }
  }
`;
