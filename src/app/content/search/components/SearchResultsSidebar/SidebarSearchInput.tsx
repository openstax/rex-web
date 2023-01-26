import React, { Component } from 'react';
import styled, { css } from 'styled-components';
import { isHtmlElement } from '../../../../guards';
import theme from '../../../../theme';
import { assertDocument } from '../../../../utils';
import * as TopbarStyled from '../../../components/Topbar/styled';
import { ResultsSidebarProps } from './SearchResultsBarWrapper';
import * as Styled from './styled';

interface State {
  query: string;
  queryProp: string;
  formSubmitted: boolean;
}

// tslint:disable-next-line: variable-name
export const StyledSearchWrapper = styled.div`
  flex: 1;
  padding: 1.6rem;
  ${(props: { background: boolean }) => props.background && css`
    background: ${theme.color.white};
    border-bottom: 0.1rem solid ${theme.color.neutral.formBorder};
  `}
  ${TopbarStyled.SearchInputWrapper} {
    margin: 0;
    width: 100%;
    background: ${theme.color.white};
  }

  ${theme.breakpoints.mobileMedium(css`
    display: none;
  `)}
`;

// tslint:disable-next-line: variable-name
const StyledSearchCloseButton = styled(TopbarStyled.CloseButton)`
  ${(props: { formSubmitted: boolean }) => !props.formSubmitted && theme.breakpoints.mobile(css`
    display: block;
  `)}
`;

// tslint:disable-next-line: variable-name
export const StyledSearchCloseButtonNew = styled(TopbarStyled.CloseButtonNew)`
  ${(props: { formSubmitted: boolean }) => !props.formSubmitted && theme.breakpoints.mobile(css`
    display: block;
  `)}
`;

export class SidebarSearchInput extends Component<ResultsSidebarProps> {
  public static getDerivedStateFromProps(newProps: ResultsSidebarProps, state: State) {
    if (newProps.query && newProps.query !== state.queryProp && newProps.query !== state.query) {
      return { ...state, query: newProps.query, queryProp: newProps.query };
    }
    return { ...state, queryProp: newProps.query };
  }

  public state = { query: '', queryProp: '', formSubmitted: this.props.results !== null };
  public newButtonEnabled = !!this.props.searchButtonColor;

  public onSearchChange = (e: React.FormEvent<HTMLInputElement>) => {
    this.setState({ query: (e.currentTarget as any).value, formSubmitted: false });
  };

  public onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activeElement = assertDocument().activeElement;
    if (this.state.query) {
      if (isHtmlElement(activeElement)) {
        activeElement.blur();
      }
      this.props.search(this.state.query);
      this.setState({ formSubmitted: true });
    }
  };

  public onSearchClear = (e: React.FormEvent) => {
    e.preventDefault();
    this.setState({ query: '', formSubmitted: false });
  };

  public render() {
    if (!this.props.searchInSidebar) {
      return null;
    }
    return <StyledSearchWrapper background={!!this.props.query}>
      <TopbarStyled.SearchInputWrapper
        action='#'
        onSubmit={this.onSearchSubmit}
        data-testid='sidebar-search'
        data-experiment
        colorSchema={this.props.searchButtonColor}
      >
        <TopbarStyled.SearchInput type='search' data-testid='sidebar-search-input'
          autoFocus
          onChange={this.onSearchChange} value={this.state.query} />
        {!this.state.formSubmitted && !this.newButtonEnabled &&
          <TopbarStyled.SearchButton colorSchema={this.props.searchButtonColor} data-experiment />
        }
        {this.state.formSubmitted && !this.newButtonEnabled &&
          <StyledSearchCloseButton type='button' onClick={this.onSearchClear} data-testid='sidebar-clear-search' />
        }
        {this.state.formSubmitted && this.newButtonEnabled &&
          <StyledSearchCloseButtonNew type='button' onClick={this.onSearchClear} data-testid='sidebar-clear-search'>
            <Styled.CloseIcon />
          </StyledSearchCloseButtonNew>
        }
        {this.newButtonEnabled &&
          <TopbarStyled.SearchButton desktop colorSchema={this.props.searchButtonColor} data-experiment />
        }
      </TopbarStyled.SearchInputWrapper>
    </StyledSearchWrapper>;
  }
}
