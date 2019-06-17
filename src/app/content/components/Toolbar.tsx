import { HTMLInputElement } from '@openstax/types/lib.dom';
import React, { SFC } from 'react';
import { FormattedMessage } from 'react-intl';
import styled, { css } from 'styled-components/macro';
import { Print } from 'styled-icons/fa-solid/Print';
import { Search } from 'styled-icons/fa-solid/Search';
import { TimesCircle } from 'styled-icons/fa-solid/TimesCircle';
import { maxNavWidth } from '../../components/NavBar';
import { contentFont, textRegularSize, textRegularStyle } from '../../components/Typography';
import theme from '../../theme';
import { assertString, assertWindow } from '../../utils';
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
const SearchIcon = styled(Search)`
  ${toolbarIconStyles}

  &[active] {
    display: none;
  }

  ${theme.breakpoints.mobile(css`
    &[active] {
      display: block;
    }

    &[show] & {
      background: pink;
    }
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
  display: none;

  &[show] {
    display: block;
  }

  &:not([show]) {
    display: none;
  }
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
const SearchInputWrapper = styled.div`
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

    :after {
      display: none;
    }
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
const PrintOptWrapper = styled.div`
  cursor: pointer;
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

      :hover, :active, &[show] {
        background: ${theme.color.primary.gray.base};

        ${SearchIcon} {
          color: ${theme.color.primary.gray.foreground};
        }
      }
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

  &[show] {
    display: none;
  }

  &:not([show]) {
    display: none;
  }

  ${barPadding}
  border-top: solid 0.1rem #efeff1;

  ${theme.breakpoints.mobile(css`
    &[show] {
      display: block;
    }
  `)}
`;

// tslint:disable-next-line:variable-name
const Toolbar: SFC = () => <BarWrapper>
  <TopBar data-testid='toolbar'>
    <SidebarControl />
    <SearchPrintWrapper id='SearchPrintWrapper'>
      <FormattedMessage id='i18n:toolbar:search:placeholder'>
        {(msg: Element | string) => <SearchInputWrapper>
          <SearchInput
            aria-label={assertString(msg, 'placeholder must be a string')}
            placeholder={assertString(msg, 'placeholder must be a string')}
            onKeyDown={handleKeyDown}
            data='searchValue' />
          <SearchIcon id='searchIcon' onClick={showSearchInput} />
          <CloseIcon className='closeIcon' onClick={clearSearch}/>
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
  <MobileSearchWrapper id='mobileSearchWrapper'>
    <FormattedMessage id='i18n:toolbar:search:placeholder'>
        {(msg: Element | string) => <SearchInputWrapper>
          <MobileSearchInput
            aria-label={assertString(msg, 'placeholder must be a string')}
            placeholder={assertString(msg, 'placeholder must be a string')}
            onKeyDown={handleKeyDown}
            data='searchValue' />
          <CloseIcon className='closeIcon' onClick={clearSearch}/>
        </SearchInputWrapper>}
      </FormattedMessage>
  </MobileSearchWrapper>
</BarWrapper>;

export default Toolbar;

const toggleSearchIcon = (opt: string, target: string) => {
  const searchIcon = document && document.getElementById('searchIcon');

  const wrapper = document && document.getElementById(target);
  const showCloseIcon = wrapper && wrapper.querySelector('.closeIcon');

  if (searchIcon && showCloseIcon) {
    if ( opt === 'on') {
      searchIcon.setAttribute('active', '');
      showCloseIcon.setAttribute('show', '');
    } else {
      searchIcon.removeAttribute('active');
      showCloseIcon.removeAttribute('show');
    }

  }
};

const showSearchInput = () => {
  const mobileSearch = document && document.getElementById('mobileSearchWrapper');
  const searchIcon = document && document.getElementById('searchIcon');
  if (mobileSearch && searchIcon) {
    mobileSearch.setAttribute('show', '');
    searchIcon.parentElement!.setAttribute('show', '');
  }
};

const handleKeyDown = (e: any) => {
  e.persist();
  const targetId = e.target.parentNode.parentNode.id;
  if (e.key === 'Enter') {
    toggleSearchIcon('on', targetId);
  }
};

const clearSearch = (e: any) => {
  e.persist();
  const target = e.target.parentNode.parentNode;
  const clearInput: HTMLInputElement | null | undefined =
    target && (target.querySelector('[data="searchValue"]') as HTMLInputElement);

  if (clearInput) {
    toggleSearchIcon('off', target.id);
    clearInput.value = '';
  }
};
