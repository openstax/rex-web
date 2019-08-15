
import styled, { css, keyframes } from 'styled-components/macro';
import { Search } from 'styled-icons/fa-solid/Search';
import { Times } from 'styled-icons/fa-solid/Times/Times';
import { navDesktopHeight } from '../../../../components/NavBar';
import {
  h3MobileFontSize,
  labelStyle,
  textRegularStyle
} from '../../../../components/Typography';
import theme from '../../../../theme';
import {
    bookBannerDesktopMiniHeight,
    searchResultsBarDesktopWidth,
    searchSidebarTopOffset,
    toolbarDesktopHeight,
  } from '../../../components/constants';
import ContentLinkComponent from '../../../components/ContentLink';
import { Summary, SummaryTitle } from '../../../components/Sidebar/styled';
import { toolbarIconStyles } from '../../../components/Toolbar';

const searchResultsBarVariables = {
    backgroundColor: theme.searchSidebar.background,
    iconRightPadding: 0.7,
    mainPaddingDesktop: 3,
    mainRightPaddingDesktop: 1.4,
};

// tslint:disable-next-line:variable-name
export const SearchIconInsideBar = styled(Search)`
  ${toolbarIconStyles}
  color: ${theme.color.primary.gray.darker};
  margin-right: ${searchResultsBarVariables.iconRightPadding}rem;
  margin-left: ${searchResultsBarVariables.mainPaddingDesktop}rem;
`;

// tslint:disable-next-line:variable-name
export const CloseIcon = styled(Times)`
  color: ${theme.color.primary.gray.lighter};
`;

// tslint:disable-next-line:variable-name
export const NavOl = styled.ol`
  .os-divider {
    width: 0.4rem;
  }
`;

const animateIn = keyframes`
  from {
    transform: translateX(-100%);
  }

  to {
    transform: translateX(0);
  }
`;

// tslint:disable-next-line:variable-name
export const SearchResultsBar = styled.div`
  top: ${bookBannerDesktopMiniHeight + toolbarDesktopHeight}rem;
  margin-top: 0;
  padding: 0;
  position: sticky;
  width: ${searchResultsBarDesktopWidth}rem;
  background-color: ${searchResultsBarVariables.backgroundColor};
  box-shadow: 0.2rem 0 0.2rem 0 rgba(0, 0, 0, 0.1);
  z-index: 1;
  height: calc(100vh - ${navDesktopHeight + bookBannerDesktopMiniHeight + toolbarDesktopHeight}rem);
  ${(props: {searchResultsOpen: boolean}) => !props.searchResultsOpen && theme.breakpoints.mobile(css`
    display: none;
  `)}

  transition: margin-left 300ms;
  margin-left: 0;
  ${(props: {closed: boolean}) => props.closed && css`
    margin-left: -${searchResultsBarDesktopWidth}rem;
  `}

  ${theme.breakpoints.mobile(css`
    width: 100%;
    margin-top: 0;
    top: ${searchSidebarTopOffset}rem;
    padding: 0;

    ${(props: {closed: boolean}) => props.closed && css`
      display: none;
    `}
  `)}

  > ${NavOl} {
    ::before {
      display: none;
    }

    margin: 0;
    padding: 0;
  }

  animation: ${animateIn} 5s;
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
  background: ${theme.color.neutral.base};
  padding: 1.2rem 0;
  min-height: 4rem;
`;

// tslint:disable-next-line:variable-name
export const SearchBarSummary = styled(Summary)`
  min-height: 3.8rem;
  display: flex;
  align-items: center;
  background: ${searchResultsBarVariables.backgroundColor};
  border-top: solid 0.1rem ${theme.searchSidebar.border};
  padding: 1rem 0 1rem ${searchResultsBarVariables.mainPaddingDesktop}rem;

  ${SummaryTitle} {
    font-weight: bold;
    padding-right: ${searchResultsBarVariables.mainRightPaddingDesktop}rem;
    line-height: 1.3;
  }
`;

// tslint:disable-next-line:variable-name
export const SearchResultsLink = styled.div`
  ${labelStyle}
  width: 100%;
  font-weight: 500;
  line-height: 1.3;
`;

// tslint:disable-next-line:variable-name
export const SectionContentPreview = styled(ContentLinkComponent)`
  ${labelStyle}
  margin-left: 6.6rem;
  min-height: 3.7rem;
  align-items: center;
  margin-right: ${h3MobileFontSize}rem;
  padding: 1.2rem 0;
  display: block;
  text-decoration: none;
  line-height: 1.3;

  :not(:last-child) {
    border-bottom: solid 0.1rem ${searchResultsBarVariables.backgroundColor};
  }

  em {
    font-weight: bold;
  }
`;

// tslint:disable-next-line:variable-name
export const LinkWrapper = styled.div`
  min-height: 3.4rem;
  display: flex;
  align-items: center;
  padding-left: 4.3rem;
  padding-top: 1.2rem;
  padding-bottom: 0.8rem;
  border-top: solid 0.2rem ${searchResultsBarVariables.backgroundColor};
`;

// tslint:disable-next-line:variable-name
export const DetailsOl = styled.ol`
  padding: 0;
`;

// tslint:disable-next-line:variable-name
export const NavItem = styled.li`
  background: ${theme.color.primary.gray.foreground};
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
  border: none;
  margin: 0;
  background: transparent;
  margin-right: ${searchResultsBarVariables.mainRightPaddingDesktop}rem;
  overflow: hidden;
  ${theme.breakpoints.mobile(css`
    display: none;
  `)};
`;

// tslint:disable-next-line:variable-name
export const CloseIconWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin: 1.4rem 1.4rem 0 0;
  ${theme.breakpoints.mobile(css`
    display: none;
  `)};

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
  background-color: ${searchResultsBarVariables.backgroundColor};
  transition: opacity 0.5s 0.3s, transform 0.2s 0.2s;
`;

// tslint:disable-next-line:variable-name
export const HeaderQuery = styled.div`
  width: 100%;
  align-self: center;
`;

// tslint:disable-next-line:variable-name
export const ListItem = styled.li`
  display: block;
`;
