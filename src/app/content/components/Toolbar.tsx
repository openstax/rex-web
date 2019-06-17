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

class Toolbar extends React.Component<{
  search: typeof requestSearch, query: string | null}, {query: string, mobileOpen: boolean
}> {
  public state = {query: '', mobileOpen: false};

  public render() {

    const onSubmit = (e: any) => {
      e.preventDefault();
      this.props.search(this.state.query);
    };

    return <BarWrapper>
      <TopBar data-testid='toolbar'>
        <SidebarControl />
        <SearchPrintWrapper id='SearchPrintWrapper'>
          <FormattedMessage id='i18n:toolbar:search:placeholder'>
            {(msg: Element | string) => <SearchInputWrapper active={this.state.mobileOpen} onSubmit={onSubmit}>
              <SearchInput
                aria-label={assertString(msg, 'placeholder must be a string')}
                placeholder={assertString(msg, 'placeholder must be a string')}
                onChange={(e: any) => this.setState({query: e.target.value})}
                value={this.state.query} />
              <SearchIconMobile onClick={() => this.setState({mobileOpen: !this.state.mobileOpen})} />
              {this.props.query !== this.state.query && <SearchIconDesktop />}
              {this.props.query === this.state.query &&
                <CloseIconHiddenMobile onClick={() => this.setState({query: ''})} />
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
      {this.state.mobileOpen && <MobileSearchWrapper id='mobileSearchWrapper'>
        <FormattedMessage id='i18n:toolbar:search:placeholder'>
            {(msg: Element | string) => <SearchInputWrapper onSubmit={onSubmit}>
              <MobileSearchInput
                aria-label={assertString(msg, 'placeholder must be a string')}
                placeholder={assertString(msg, 'placeholder must be a string')}
                onChange={(e: any) => this.setState({query: e.target.value})}
                value={this.state.query} />
              {this.props.query === this.state.query && <CloseIcon onClick={() => this.setState({query: ''})} />}
            </SearchInputWrapper>}
          </FormattedMessage>
      </MobileSearchWrapper>}
    </BarWrapper>;
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
