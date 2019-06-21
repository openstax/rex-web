import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import { Print } from 'styled-icons/fa-solid/Print';
import { Search } from 'styled-icons/fa-solid/Search';
import { TimesCircle } from 'styled-icons/fa-solid/TimesCircle';
import { maxNavWidth } from '../../components/NavBar';
import { contentFont, textRegularSize, textRegularStyle } from '../../components/Typography';
import theme from '../../theme';
import { AppState, Dispatch } from '../../types';
import { assertString, assertWindow } from '../../utils';
import { requestSearch } from '../search/actions';
import * as selectSearch from '../search/selectors';
import {
  bookBannerDesktopMiniHeight,
  bookBannerMobileMiniHeight,
  toolbarDesktopHeight,
  toolbarIconColor,
  toolbarMobileHeight
} from './constants';
import SidebarControl from './SidebarControl';
import { disablePrint } from './utils/disablePrint';

export const toolbarIconStyles = css`
  height: 1.4rem;
  width: 1.4rem;
  cursor: pointer;
`;

const barPadding = css`
  padding: 0 ${theme.padding.page.desktop}rem;
  ${theme.breakpoints.mobile(css`
    padding: 0 ${theme.padding.page.mobile}rem;
  `)}
`;

// tslint:disable-next-line:variable-name
const SearchIconDesktop = styled(Search)`
  ${toolbarIconStyles}
  ${theme.breakpoints.mobile(css`
    display: none;
  `)}
`;
// tslint:disable-next-line:variable-name
const SearchIconMobile = styled(Search)`
  ${toolbarIconStyles}
  display: none;
  ${theme.breakpoints.mobile(css`
    display: block;
  `)}
`;

// tslint:disable-next-line:variable-name
const SearchIconInsideBar = styled(Search)`
  ${toolbarIconStyles}
`;

// tslint:disable-next-line:variable-name
const PrintIcon = styled(Print)`
  ${toolbarIconStyles}
`;

// tslint:disable-next-line:variable-name
const CloseIcon = styled(TimesCircle)`
  ${toolbarIconStyles}
  color: ${theme.color.primary.gray.lighter};
`;

// tslint:disable-next-line:variable-name
const CloseIconHiddenMobile = styled(CloseIcon)`
  ${theme.breakpoints.mobile(css`
    display: none;
  `)}
`;

// tslint:disable-next-line:variable-name
const TopBar = styled.div`
  height: ${toolbarDesktopHeight}rem;
  max-width: ${maxNavWidth}rem;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  overflow: visible;
  ${barPadding};
  ${theme.breakpoints.mobile(css`
    height: ${toolbarMobileHeight}rem;
  `)}
`;

// tslint:disable-next-line:variable-name
const SearchInputWrapper = styled.form`
  display: flex;
  align-items: center;
  margin-right: 4rem;
  position: relative;
  color: ${toolbarIconColor.base};
  border: solid 0.1rem;
  padding-left: 1rem;
  padding-right: 1rem;
  border-radius: 0.2rem;

  :focus-within {
    border: solid 0.1rem #0cc0dc;
  }

  ${theme.breakpoints.mobile(css`
    margin-right: 1rem;
    height: 100%;

    ${(props: {active: boolean}) => props.active && css`
      background: ${theme.color.primary.gray.base};

      ${SearchIconMobile} {
        color: ${theme.color.primary.gray.foreground};
      }
    `}
  `)}
`;

const generalInput = css`
  ${textRegularStyle}
  color: ${theme.color.text.default};
  line-height: 3.2rem;
  height: 3.2rem;
  border: none;
  outline: none;

  ::placeholder {
    color: ${toolbarIconColor.base};
  }
`;

// tslint:disable-next-line:variable-name
const SearchInput = styled.input`
  ${generalInput}
  ${theme.breakpoints.mobile(css`
    display: none;
  `)}
`;

// tslint:disable-next-line:variable-name
const MobileSearchInput = styled.input`
  ${generalInput}
  width: 100%;
`;

// tslint:disable-next-line:variable-name
const PrintOptWrapper = styled.button`
  display: flex;
  cursor: pointer;
  border: none;
  padding: 0;
  background: none;
  align-items: center;
  color: ${toolbarIconColor.base};

  :hover,
  :focus {
    outline: none;
    color: ${toolbarIconColor.darker};
  }
`;

// tslint:disable-next-line:variable-name
const PrintOptions = styled.span`
  font-weight: 600;
  font-family: ${contentFont};
  ${textRegularSize};
  margin: 0;
  ${theme.breakpoints.mobile(css`
    display: none;
  `)}
`;

// tslint:disable-next-line:variable-name
const SearchPrintWrapper = styled.div`
  text-align: right;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: visible;
  ${theme.breakpoints.mobile(css`
    height: 100%;
    ${SearchInputWrapper} {
      border: none;
      border-radius: 0;
    }
  `)}
`;

// tslint:disable-next-line:variable-name
const BarWrapper = styled.div`
  position: sticky;
  top: ${bookBannerDesktopMiniHeight}rem;
  width: 100%;
  box-shadow: 0 0.2rem 0.2rem 0 rgba(0, 0, 0, 0.14);
  display: block;
  z-index: 2; /* stay above book content */
  background-color: ${theme.color.neutral.base};
  ${theme.breakpoints.mobile(css`
    top: ${bookBannerMobileMiniHeight}rem;
  `)}

  ${disablePrint}
`;

// tslint:disable-next-line:variable-name
const MobileSearchWrapper = styled.div`
  ${SearchInputWrapper} {
    margin: 1rem 0;
  }

  display: none;
  ${barPadding}
  border-top: solid 0.1rem #efeff1;
  ${theme.breakpoints.mobile(css`
    display: block;
  `)}
`;

// tslint:disable-next-line:variable-name
const SearchResultsBar = styled.div`
  top: calc(7rem + ${toolbarDesktopHeight}rem);
  overflow-y: auto;
  height: calc(100vh - 12rem);
  transition: transform 300ms ease-in-out,box-shadow 300ms ease-in-out,background-color 300ms ease-in-out;
  background-color: #fafafa;
  z-index: 4;
  margin-left: -50vw;
  /*padding-left: 50vw;*/
  width: calc(50vw + 43.5rem);
  /*min-width: calc(50vw + 43.5rem);*/
  box-shadow: 0.2rem 0 0.2rem 0 rgba(0,0,0,0.1);
  display: flex;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  position: sticky;
`;

// tslint:disable-next-line:variable-name
const SearchQuery = styled.div`
  display: flex;
  align-items: center;
`;

class Toolbar extends React.Component<{
  search: typeof requestSearch, query: string | null}, {query: string, mobileOpen: boolean, formSubmitted: boolean
}> {
  public state = {query: '', mobileOpen: false, formSubmitted: false};

  public render() {

    const onSubmit = (e: any) => {
      e.preventDefault();
      this.props.search(this.state.query);
      this.setState({formSubmitted: true});
    };

    return [ <BarWrapper>
      <TopBar data-testid='toolbar'>
        <SidebarControl />
        <SearchPrintWrapper>
          <FormattedMessage id='i18n:toolbar:search:placeholder'>
            {(msg: Element | string) => <SearchInputWrapper active={this.state.mobileOpen} onSubmit={onSubmit}>
              <SearchInput
                aria-label={assertString(msg, 'placeholder must be a string')}
                placeholder={assertString(msg, 'placeholder must be a string')}
                onChange={(e: any) => this.setState({query: e.target.value, formSubmitted: false})}
                value={this.state.query} />
              <SearchIconMobile onClick={() => this.setState({mobileOpen: !this.state.mobileOpen})} />
              {!this.state.formSubmitted && <SearchIconDesktop />}
              {this.state.formSubmitted &&
                <CloseIconHiddenMobile onClick={() => this.setState({query: '', formSubmitted: false})} />
              }
            </SearchInputWrapper>}
          </FormattedMessage>
          <FormattedMessage id='i18n:toolbar:print:text'>
            {(msg: Element | string) =>
              <PrintOptWrapper
                aria-label='print'
                onClick={() => assertWindow().print()}
                data-testid='print'
              >
                <PrintIcon /><PrintOptions>{msg}</PrintOptions>
              </PrintOptWrapper>
            }
          </FormattedMessage>
        </SearchPrintWrapper>
      </TopBar>
      {this.state.mobileOpen && <MobileSearchWrapper>
        <FormattedMessage id='i18n:toolbar:search:placeholder'>
            {(msg: Element | string) => <SearchInputWrapper onSubmit={onSubmit}>
              <MobileSearchInput
                aria-label={assertString(msg, 'placeholder must be a string')}
                placeholder={assertString(msg, 'placeholder must be a string')}
                onChange={(e: any) => this.setState({query: e.target.value, formSubmitted: false})}
                value={this.state.query} />
              {this.state.formSubmitted &&
                <CloseIcon onClick={() => this.setState({query: '', formSubmitted: false})} />
              }
            </SearchInputWrapper>}
          </FormattedMessage>
      </MobileSearchWrapper>}
    </BarWrapper>,
    ];
  }
}

export default connect(
  (state: AppState) => ({
    query: selectSearch.query(state),
  }),
  (dispatch: Dispatch) => ({
    search: (query: string) => dispatch(requestSearch(query)),
  })
)(Toolbar);

// tslint:disable-next-line:variable-name
export const SearchBarControl = (Control: React.ComponentType<{
  search: typeof requestSearch, query: string | null}>) =>
  connect((props: {search: typeof requestSearch, query: string | null}) => <Control {...props}>
    {props.query && <SearchResultsBar>
      <SearchQuery><SearchIconInsideBar/></SearchQuery>
    </SearchResultsBar>}
  </Control>);
