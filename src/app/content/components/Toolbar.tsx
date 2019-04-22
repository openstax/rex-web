import React, { SFC } from 'react';
import { FormattedMessage } from 'react-intl';
import styled, { css } from 'styled-components/macro';
import { Print } from 'styled-icons/fa-solid/Print';
import { Search } from 'styled-icons/fa-solid/Search';
import { maxNavWidth } from '../../components/NavBar';
import { contentFont, textRegularLineHeight, textRegularSize, textRegularStyle } from '../../components/Typography';
import theme from '../../theme';
import { assertString } from '../../utils';
import {
  bookBannerDesktopMiniHeight,
  bookBannerMobileMiniHeight,
  toolbarDesktopHeight,
  toolbarIconColor,
  toolbarMobileHeight
} from './constants';
import SidebarControl from './SidebarControl';

export const toolbarIconStyles = css`
  height: ${textRegularLineHeight}rem;
  width: ${textRegularLineHeight}rem;
  padding: 0.4rem;
  margin-right: 0.5rem;
`;

// tslint:disable-next-line:variable-name
const SearchIcon = styled(Search)`
  ${toolbarIconStyles}
`;

// tslint:disable-next-line:variable-name
const PrintIcon = styled(Print)`
  ${toolbarIconStyles}
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
  ${theme.breakpoints.mobile(css`
    height: ${toolbarMobileHeight}rem;
  `)}
`;

// tslint:disable-next-line:variable-name
const SearchInputWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-right: 4rem;
  position: relative;
  color: ${toolbarIconColor.base};

  ::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    border-bottom: solid 0.1rem ${toolbarIconColor.base};
  }

  ${theme.breakpoints.mobile(css`
    border: none;
    margin-right: 1rem;

    :after {
      display: none;
    }
  `)}
`;

// tslint:disable-next-line:variable-name
const SearchInput = styled.input`
  ${textRegularStyle}
  color: ${theme.color.text.default};
  height: ${textRegularLineHeight}rem;
  border: none;
  outline: none;

  ::placeholder {
    color: ${toolbarIconColor.base};
  }

  ${theme.breakpoints.mobile(css`
    display: none;
  `)}
`;

// tslint:disable-next-line:variable-name
const PrintOptWrapper = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  color: ${toolbarIconColor.base};

  :hover {
    color: ${toolbarIconColor.darker};
  }
`;

// tslint:disable-next-line:variable-name
const PrintOptions = styled.span`
  font-weight: 700;
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
`;

// tslint:disable-next-line:variable-name
const BarWrapper = styled.div`
  position: sticky;
  top: ${bookBannerDesktopMiniHeight}rem;
  width: 100%;
  padding: 0 ${theme.padding.page.desktop}rem;
  box-shadow: 0 0.2rem 0.2rem 0 rgba(0, 0, 0, 0.14);
  display: block;
  z-index: 2; /* stay above book content */
  background-color: ${theme.color.neutral.base};
  ${theme.breakpoints.mobile(css`
    top: ${bookBannerMobileMiniHeight}rem;
    padding: 0 ${theme.padding.page.mobile}rem;
  `)}
`;

// tslint:disable-next-line:variable-name
const Toolbar: SFC = () => <BarWrapper>
  <TopBar>
    <SidebarControl />
    <SearchPrintWrapper>
      <FormattedMessage id='i18n:toolbar:search:placeholder'>
        {(msg: Element | string) => <SearchInputWrapper>
          <SearchIcon /><SearchInput placeholder={assertString(msg, 'placeholder must be a string')}></SearchInput>
        </SearchInputWrapper>}
      </FormattedMessage>
      <FormattedMessage id='i18n:toolbar:print:text'>
        {(msg: Element | string) => <PrintOptWrapper><PrintIcon /><PrintOptions>{msg}</PrintOptions></PrintOptWrapper>}
      </FormattedMessage>
    </SearchPrintWrapper>
  </TopBar>
</BarWrapper>;

export default Toolbar;
