
import styled, { css } from 'styled-components/macro';
import { Search } from 'styled-icons/fa-solid/Search';
import { Times } from 'styled-icons/fa-solid/Times/Times';
import { iconSize } from '../../../components/Details';
import { navDesktopHeight } from '../../../components/NavBar';
import { labelStyle, textRegularLineHeight, textRegularStyle } from '../../../components/Typography';
import theme from '../../../theme';
import {
    bookBannerDesktopMiniHeight,
    searchResultsBarDesktopWidth,
    toolbarDesktopHeight,
    toolbarMobileElementsHeight,
    toolbarMobileSearchWrapperHeight,
  } from '../constants';
import ContentLinkComponent from '../ContentLink';
import { Summary } from '../Sidebar/styled';
import { toolbarIconStyles } from '../Toolbar';

const searchResultsBarVariables = {
    backgroundColor: '#f1f1f1',
    iconRightPadding: 0.7,
    mainPaddingDesktop: 3,
    mainPaddingMobile: 2,
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
  ${toolbarIconStyles}
  color: ${theme.color.primary.gray.lighter};
  margin-right: ${searchResultsBarVariables.mainRightPaddingDesktop}rem;
`;

// tslint:disable-next-line:variable-name
export const NavOl = styled.ol`
  .os-divider {
    width: 0.4rem;
  }
`;

// tslint:disable-next-line:variable-name
export const SearchResultsBar = styled.div`
  top: calc(${bookBannerDesktopMiniHeight + toolbarDesktopHeight}rem);
  margin-top: 0;
  padding: 0;
  position: sticky;
  width: ${searchResultsBarDesktopWidth}rem;
  background-color: ${searchResultsBarVariables.backgroundColor};
  box-shadow: 0.2rem 0 0.2rem 0 rgba(0, 0, 0, 0.1);
  z-index: 2;
  height: calc(100vh - ${navDesktopHeight + bookBannerDesktopMiniHeight
                        + toolbarDesktopHeight}rem);

  ${theme.breakpoints.mobile(css`
    position: fixed;
    right: 0;
    width: 100%;
    margin-top: 0;
    top: ${toolbarMobileElementsHeight + toolbarMobileSearchWrapperHeight}rem;
    padding: 0;
  `)}

  > ${NavOl} {
    ::before {
      display: none;
    }
    margin: 0;
    padding: 0;
  }

`;

// tslint:disable-next-line:variable-name
export const SearchQuery = styled.div`
  ${textRegularStyle}
  display: flex;
  align-items: center;
  justify-content: end;
  min-height: 4rem;

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
  padding: 1rem 0;
`;

// tslint:disable-next-line:variable-name
export const SearchBarSummary = styled(Summary)`
    min-height: 3.8rem;
    display: flex;
    align-items: center;
    background: ${searchResultsBarVariables.backgroundColor};
    border-top: solid 0.1rem #d5d5d5;
    padding-left: ${searchResultsBarVariables.mainPaddingDesktop}rem;
`;

// tslint:disable-next-line:variable-name
export const SearchResultsLink = styled.div`
  ${labelStyle}
  width: 100%;
`;

// tslint:disable-next-line:variable-name
export const SectionContentPreview = styled(ContentLinkComponent)`
  ${labelStyle}
  margin-left: ${searchResultsBarVariables.mainPaddingDesktop + iconSize + 2.3}rem;
  min-height: 3.7rem;
  align-items: center;
  padding-right: 1.6rem;
  padding: 1rem 0;
  max-width: 35.3rem;
  display: block;
  text-decoration: none;

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
    padding-left: ${searchResultsBarVariables.mainPaddingDesktop + iconSize}rem;
    padding-top: 1rem;
    padding-bottom: 0.6rem;
`;

// tslint:disable-next-line:variable-name
export const DetailsOl = styled.ol`
  padding: 0;
`;

// tslint:disable-next-line:variable-name
export const NavItem = styled.li`
  background: ${theme.color.primary.gray.foreground};
  :not(:last-child) {
    border-bottom: solid 0.2rem ${searchResultsBarVariables.backgroundColor};
  }
`;

// tslint:disable-next-line:variable-name
export const SearchQueryAlignment = styled.div`
  max-width: 26.5rem;
  text-align: justify;
  /*textRegularLineHeight is the close icon height*/
  margin-top: calc(7rem - ${textRegularLineHeight}rem);
  margin-left: auto;
  margin-right: auto;
`;

// tslint:disable-next-line:variable-name
export const CloseIconWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  ${theme.breakpoints.mobile(css`
    display: none;
  `)};
`;

// tslint:disable-next-line:variable-name
export const LoadingWrapper = styled.div`
  overflow: hidden;
  right: 0;
  top: 0;
  position: absolute;
  transition: opacity 0.2s;
  width: 100%;
  height: 100%;
  background-color: ${searchResultsBarVariables.backgroundColor};
  z-index: 5;
  transition: opacity 0.5s 0.3s, transform 0.2s 0.2s;
`;

// tslint:disable-next-line:variable-name
export const CloseIconButton = styled.button`
  border: none;
  padding: 0;
  margin: 0;
  background: transparent;
  ${theme.breakpoints.mobile(css`
    display: none;
  `)};
`;

// tslint:disable-next-line:variable-name
export const HeaderQuery = styled.div`
  max-width: calc(${searchResultsBarDesktopWidth - (textRegularLineHeight * 2)
              - searchResultsBarVariables.mainPaddingDesktop
              - searchResultsBarVariables.mainRightPaddingDesktop}rem)
`;
