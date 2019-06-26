import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import { Search } from 'styled-icons/fa-solid/Search';
import { Times } from 'styled-icons/fa-solid/Times/Times';
import { Details, iconSize } from '../../components/Details';
import { navDesktopHeight, navMobileHeight } from '../../components/NavBar';
import { labelStyle, textRegularStyle } from '../../components/Typography';
import theme from '../../theme';
import { AppState } from '../../types';
import * as selectSearch from '../search/selectors';
import {
  bookBannerDesktopMiniHeight,
  bookBannerMobileMiniHeight,
  searchResultsBarDesktopWidth,
  searchResultsBarMobileWidth,
  sidebarDesktopWidth,
  toolbarDesktopHeight,
} from './constants';
import { CollapseIcon, ExpandIcon, Summary, SummaryTitle, SummaryWrapper } from './Sidebar/styled';
import { toolbarIconStyles } from './Toolbar';

const searchResultsBarVariables = {
    backgroundColor: '#f1f1f1',
    mainPadding: 3,
};

// tslint:disable-next-line:variable-name
const SearchIconInsideBar = styled(Search)`
  ${toolbarIconStyles}
  color: ${theme.color.primary.gray.darker};
  margin-right: 0.7rem;
  margin-left: 3rem;
`;

// tslint:disable-next-line:variable-name
const CloseIcon = styled(Times)`
  ${toolbarIconStyles}
  color: ${theme.color.primary.gray.lighter};
  margin-right: 1.4rem;
`;

// tslint:disable-next-line:variable-name
const SearchResultsBar = styled.div`
  top: calc(${bookBannerDesktopMiniHeight}rem + ${toolbarDesktopHeight}rem);
  overflow-y: auto;
  height: calc(100vh - ${navDesktopHeight + bookBannerDesktopMiniHeight}rem);
  transition: transform 300ms ease-in-out,box-shadow 300ms ease-in-out,background-color 300ms ease-in-out;
  background-color: #fafafa;
  z-index: 4;
  margin-left: calc(-50vw - ${sidebarDesktopWidth}rem);;
  padding-left: 50vw;
  width: calc(50vw + ${searchResultsBarDesktopWidth}rem);
  min-width: calc(50vw + ${searchResultsBarDesktopWidth}rem);
  box-shadow: 0.2rem 0 0.2rem 0 rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  position: sticky;

  &:not([open]) {
    display: none;
  }

  &[open] {
    display: block;
  }

  ${theme.breakpoints.mobile(css`
    width: calc(50vw + ${searchResultsBarMobileWidth}vw);
    min-width: calc(50vw + ${searchResultsBarMobileWidth}vw);
    top: ${bookBannerMobileMiniHeight}rem;
    height: calc(100vh - ${navMobileHeight + bookBannerMobileMiniHeight}rem);
  `)}

`;

// tslint:disable-next-line:variable-name
const SearchQuery = styled.div`
  ${textRegularStyle}
  display: flex;
  align-items: center;
  min-height: 4rem;

  strong {
    padding-left: 0.4rem;
  }
`;

// tslint:disable-next-line:variable-name
const SearchQueryWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${theme.color.neutral.base};
  padding: 1rem 0;
`;

// tslint:disable-next-line:variable-name
const NavOl = styled.ol`
    margin: 0;
    padding: 0;
`;

// tslint:disable-next-line:variable-name
const SearchBarSummary = styled(Summary)`
    min-height: 3.8rem;
    display: flex;
    align-items: center;
    background: ${searchResultsBarVariables.backgroundColor};
    border-top: solid 0.1rem #d5d5d5;
    padding-left: ${searchResultsBarVariables.mainPadding}rem;
`;

// tslint:disable-next-line:variable-name
const SearchResultsLink = styled.a`
  ${labelStyle}
  text-decoration: none;
  width: 100%;
`;

// tslint:disable-next-line:variable-name
const SectionContentPreview = styled.div`
  ${labelStyle}
    padding-left: ${searchResultsBarVariables.mainPadding + iconSize + 2.3}rem;
    min-height: 3.7rem;
    display: flex;
    align-items: center;
    padding-right: 1.6rem;
    margin: 1rem 0;
`;

// tslint:disable-next-line:variable-name
const LinkWrapper = styled.div`
    min-height: 3.4rem;
    display: flex;
    align-items: center;
    padding-left: ${searchResultsBarVariables.mainPadding + iconSize}rem;
`;

// tslint:disable-next-line:variable-name
const DetailsOl = styled.ol`
  padding: 0;
`;

// tslint:disable-next-line:variable-name
const NavItem = styled.li`
    border-bottom: solid 0.2rem ${searchResultsBarVariables.backgroundColor};
`;

// tslint:disable-next-line:variable-name
const SearchResultsSidebar = (query: any ) => <SearchResultsBar open={query.query ? true : false }>
    <SearchQueryWrapper><FormattedMessage id='i18n:search-results:bar:query:results'>
            {(msg: Element | string) =>
                <SearchQuery>
                <SearchIconInsideBar /><div>{msg} <strong> &lsquo;{query.query}&rsquo;</strong></div>
                </SearchQuery>
            }
        </FormattedMessage>
        <CloseIcon/>
    </SearchQueryWrapper>
    <NavOl>
        <li>
            <Details>
                <SearchBarSummary>
                    <SummaryWrapper>
                        <ExpandIcon/>
                        <CollapseIcon/>
                        <SummaryTitle>
                            <span className='os-number'>1</span><span className='os-divider'> </span>
                            <span className='os-text'>Science and the universe: A Brief Tour</span>
                        </SummaryTitle>
                    </SummaryWrapper>
                </SearchBarSummary>
                <DetailsOl>
                    <NavItem>
                        <LinkWrapper>
                            <SearchResultsLink href='#'>
                                <span className='os-number'>1.1</span><span className='os-divider'> </span>
                                <span className='os-text'>Section title</span>
                            </SearchResultsLink>
                        </LinkWrapper>
                        <SectionContentPreview>
                            died because of a cosmic collision. a tiny moon
                            whose gravity is so weak that one good throw of a cosmic
                        </SectionContentPreview>
                    </NavItem>
                    <NavItem>
                        <LinkWrapper>
                            <SearchResultsLink href='#'>
                                <span className='os-number'>1.2</span><span className='os-divider'> </span>
                                <span className='os-text'>Chemistry in Context</span>
                            </SearchResultsLink>
                        </LinkWrapper>
                    </NavItem>
                </DetailsOl>
            </Details>
        </li>
    </NavOl>
</SearchResultsBar>;

export default connect(
  (state: AppState) => ({
    query: selectSearch.query(state),
  })
)(SearchResultsSidebar);
