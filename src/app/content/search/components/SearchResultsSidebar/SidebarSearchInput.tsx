import React, { Component } from 'react';
import classNames from 'classnames';
import { isHtmlElement } from '../../../../guards';
import { assertDocument } from '../../../../utils';
import * as TopbarStyled from '../../../components/Topbar/styled';
import { ResultsSidebarProps } from './SearchResultsBarWrapper';
import { HTMLInputElement } from '@openstax/types/lib.dom';
import Times from '../../../../components/Times';
import './SidebarSearchInput.css';

interface State {
  query: string;
  queryProp: string;
  formSubmitted: boolean;
}

// CloseIcon component for the new button
const CloseIcon = (props: React.SVGAttributes<SVGSVGElement>) => (
  <Times {...props} className="close-icon" aria-hidden='true' />
);

// Search in sidebar experiment
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
    this.setState({ query: (e.currentTarget as HTMLInputElement).value, formSubmitted: false });
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

    const wrapperClassName = classNames('styled-search-wrapper', {
      'styled-search-wrapper--with-background': !!this.props.query,
    });

    const closeButtonClassName = classNames({
      'styled-search-close-button--show-on-mobile': this.state.formSubmitted,
    });

    const closeButtonNewClassName = classNames({
      'styled-search-close-button-new--show-on-mobile': this.state.formSubmitted,
    });

    return <div className={wrapperClassName}>
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
          <TopbarStyled.CloseButton
            className={closeButtonClassName}
            formSubmitted={this.state.formSubmitted}
            type='button'
            onClick={this.onSearchClear}
            data-testid='sidebar-clear-search'
          />
        }
        {this.state.formSubmitted && this.newButtonEnabled &&
          <TopbarStyled.CloseButtonNew
            className={closeButtonNewClassName}
            formSubmitted={this.state.formSubmitted}
            type='button'
            onClick={this.onSearchClear}
            data-testid='sidebar-clear-search'
          >
            <CloseIcon />
          </TopbarStyled.CloseButtonNew>
        }
        {this.newButtonEnabled &&
          <TopbarStyled.SearchButton desktop colorSchema={this.props.searchButtonColor} data-experiment />
        }
      </TopbarStyled.SearchInputWrapper>
    </div>;
  }
}
