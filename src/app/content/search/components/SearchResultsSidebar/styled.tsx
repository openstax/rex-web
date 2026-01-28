import React from 'react';
import { FlattenSimpleInterpolation } from 'styled-components';
import styled, { css, keyframes } from 'styled-components/macro';
import { Details as BaseDetails, Summary } from '../../../../components/Details';
import { navDesktopHeight, navMobileHeight } from '../../../../components/NavBar';
import Times from '../../../../components/Times';
import {
  labelStyle,
  textRegularStyle,
  textStyle,
} from '../../../../components/Typography';
import theme, { hiddenButAccessible } from '../../../../theme';
import {
    bookBannerDesktopMiniHeight,
    bookBannerMobileMiniHeight,
    searchResultsBarDesktopWidth,
    searchResultsBarMobileWidth,
    searchSidebarTopOffset,
    sidebarTransitionTime,
    toolbarIconColor,
    topbarDesktopHeight,
    topbarMobileHeight,
    verticalNavbarMaxWidth,
  } from '../../../components/constants';
import ContentLinkComponent from '../../../components/ContentLink';
import { toolbarIconStyles } from '../../../components/Toolbar/iconStyles';
import { disablePrint } from '../../../components/utils/disablePrint';

const borderColor = 'rgba(0, 0, 0, 0.06)';
const backgroundColor = '#fafafa';
const headerHeight = 4;

export const SearchIconInsideBar = styled.img`
  ${toolbarIconStyles}
  height: ${headerHeight}rem;
  color: ${theme.color.primary.gray.darker};
  margin-right: 0.7rem;
  margin-left: 1.6rem;
  ${theme.breakpoints.mobileMedium(css`
    margin-left: ${theme.padding.page.mobile}rem;
  `)}
`;

export const CloseIcon = styled((props) => <Times {...props} aria-hidden='true' focusable='false' />)`
  ${toolbarIconStyles}
  vertical-align: middle;
  color: ${toolbarIconColor.base};

  :hover {
    color: ${toolbarIconColor.darker};
  }
`;

export const NavWrapper = styled.nav``;

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
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(0);
  }
`;

const sidebarHideAnimation = keyframes`
  0% {
    transform: translateX(0);
  }

  99% {
    transform: translateX(-100%);
  }

  100% {
    visibility: hidden;
    transform: translateX(-100%);
  }
`;

export const styleWhenSearchClosed = (closedStyle: FlattenSimpleInterpolation) => css`
  ${(props: {searchResultsOpen: boolean}) => !props.searchResultsOpen && theme.breakpoints.mobile(closedStyle)}
  ${(props: {searchResultsOpen: boolean, hasQuery: boolean}) =>
    !props.searchResultsOpen && !props.hasQuery && closedStyle
  }
`;

const styleWhenMobileToolbarClosed = (closedStyle: FlattenSimpleInterpolation) => css`
  ${(props: {mobileToolbarOpen: boolean; hasQuery: boolean}) =>
    (!props.mobileToolbarOpen || (props.mobileToolbarOpen && !props.hasQuery)) &&
    theme.breakpoints.mobileMedium(closedStyle)}
`;

export const SearchResultsBar = styled.div`
  -webkit-overflow-scrolling: touch;
  overflow-x: visible;
  grid-area: 1 / 2 / auto / 3;
  position: sticky;
  top: ${bookBannerDesktopMiniHeight}rem;
  width: ${searchResultsBarDesktopWidth}rem;
  background-color: ${backgroundColor};
  box-shadow: 0.2rem 0 0.2rem 0 rgba(0, 0, 0, 0.1);
  transform-origin: left;
  transform: scaleX(0);
  z-index: ${theme.zIndex.sidebar};
  height: calc(100vh - ${navDesktopHeight + bookBannerDesktopMiniHeight}rem);
  max-height: calc(100vh - ${bookBannerDesktopMiniHeight}rem);
  animation: ${sidebarOpenAnimation} ${sidebarTransitionTime}ms forwards;
  ${styleWhenSearchClosed(css`
    animation: ${sidebarHideAnimation} ${sidebarTransitionTime}ms forwards;
  `)}
  ${styleWhenMobileToolbarClosed(css`
    display: none;
  `)}
  ${theme.breakpoints.mobile(css`
    width: ${searchResultsBarMobileWidth}rem;
    top: ${bookBannerMobileMiniHeight}rem;
    left: ${verticalNavbarMaxWidth}rem;
    height: calc(100vh - ${navMobileHeight + bookBannerMobileMiniHeight}rem);
    max-height: calc(100vh - ${bookBannerMobileMiniHeight}rem);
  `)}

  ${theme.breakpoints.mobileMedium(css`
    grid-column: 1 / -1;
    z-index: ${theme.zIndex.sidebar};
    left: 0;
    width: 100%;
    margin-top: 0;
    top: ${searchSidebarTopOffset}rem;
    max-height: calc(100vh - ${bookBannerMobileMiniHeight + topbarMobileHeight}rem);
  `)}

  > ${NavWrapper} {
    position: relative;
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

export const SearchResultsHeader = styled.h2`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${theme.color.neutral.formBorder};
  height: ${topbarDesktopHeight}rem;
  margin: 0;
  ${({ emptyHeaderStyle = false }: { emptyHeaderStyle: boolean }) => emptyHeaderStyle && css`
    border-bottom: 0;
    justify-content: flex-end;
  `}
  ${theme.breakpoints.mobileMedium(css`
    height: unset;
  `)}
`;

export const SearchResultsHeaderTitle = styled.span`
  font-size: 1.8rem;
  margin-left: 16px;
  padding: 1rem 0;
  color: ${theme.color.primary.gray.base};
  font-weight: bold;
`;

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

export const SearchQueryWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  background: ${backgroundColor};
  min-height: ${headerHeight}rem;
  overflow: visible;
`;

export const SearchResultsTopBar = styled.div`
  display: flex;
  flex-direction: column;

  ${SearchQuery} {
    border-bottom: 1px solid ${theme.color.neutral.formBorder};
  }
`;

export const SummaryTitle = styled.h3`
  ${labelStyle}
  font-weight: bold;
  padding-right: 1.6rem;
  line-height: 1.3;
  margin: 0;
`;

export const Details = styled(BaseDetails)`
  overflow: visible;
`;

export const SearchBarSummaryContainer = styled.div`
  display: flex;
  align-items: normal;
  background: rgba(0, 0, 0, 0.17);
  padding: 1rem 0 1rem 1.6rem;
  border-top: solid 0.1rem ${borderColor};
  ${theme.breakpoints.mobileMedium(css`
    padding-left: ${theme.padding.page.mobile}rem;

    ${SummaryTitle} {
      padding-right: ${theme.padding.page.mobile}rem;
    }
  `)}
`;

export const SearchBarSummary = styled(Summary)`
  min-height: 3.8rem;

  > * {
    outline: none;
  }
`;

export const SearchResultsLink = styled.h4`
  ${labelStyle}
  width: 100%;
  font-weight: 700;
  line-height: 1.3;
  margin: 0;
`;

interface SectionContentPreviewProps extends React.ComponentProps<typeof ContentLinkComponent > {
  selectedResult: boolean;
}

export const SectionContentPreview = styled(
  React.forwardRef<HTMLAnchorElement, SectionContentPreviewProps>(
    ({selectedResult, ...props}: {selectedResult: unknown}, ref) => <ContentLinkComponent {...props} ref={ref} />
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

export const LinkWrapper = styled.div`
  min-height: 3.4rem;
  display: flex;
  align-items: center;
  padding: 1.2rem 1.6rem 0.8rem 1.6rem;
  border-top: solid 0.2rem ${borderColor};
  ${theme.breakpoints.mobileMedium(css`
    padding-left: 3.3rem;
  `)}
`;

export const DetailsOl = styled.ol`
  overflow: visible;
  padding: 0;

  ${LinkWrapper}{
    padding-left: 2.5rem;
  }
`;

export const NavItem = styled.li`
  overflow: visible;
  background: ${backgroundColor};
`;

export const SearchQueryAlignment = styled.div`
  max-width: 26.5rem;
  text-align: center;
  margin-top: 7rem;
  margin-left: auto;
  margin-right: auto;
`;

export const CloseIconButton = styled.button`
  cursor: pointer;
  border: none;
  padding: 0;
  margin: 0.3rem; /* some space to show focus outline */
  background: transparent;
  overflow: visible;
  height: ${headerHeight - 0.3}rem;
  width: ${headerHeight - 0.3}rem;
  ${theme.breakpoints.mobileMedium(css`
    display: none;
  `)}
`;

export const CloseIconWrapper = styled.div`
  overflow: visible;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  ${theme.breakpoints.mobileMedium(css`
    display: none;
  `)}
  ${CloseIconButton} {
    margin: 0.3rem;
  }
`;

export const LoadingWrapper = styled.div`
  overflow: hidden;
  right: 0;
  top: 0;
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: ${backgroundColor};
  transition: opacity 0.5s 0.3s, transform 0.2s 0.2s;
  ${CloseIconWrapper} {
    height: ${topbarDesktopHeight}rem;
  }
`;

export const HeaderQuery = styled.div`
  flex: 1;
  padding: 1rem 0;
  align-self: center;
`;

export const ListItem = styled.li`
  overflow: visible;
  display: block;
`;

export const SearchResultsSectionTitle = styled.h3`
  ${textStyle}
  font-size: 1.8rem;
  font-weight: bold;
  display: flex;
  margin: 0;
  padding: 1.2rem 3.2rem;
`;

export const KeyTermContainer = styled.div``;

export const RelatedKeyTerms = styled.div`
  background-color: ${theme.color.white};

  ${SectionContentPreview} {
    padding-right: 2.4rem;
  }
`;

export const KeyTerm = styled.span`
  display: block;
  font-weight: bold;
`;

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

export const BlankStateWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

export const BlankStateMessage = styled.div`
  display: flex;
  flex-grow: 1;
  align-items: center;
  justify-content: center;
  color: ${theme.color.text.default};
  font-size: 1.6rem;
`;

export const HiddenMessageContainer = styled.div`
    ${hiddenButAccessible}
`;
