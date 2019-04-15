import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components';
import { ChevronLeft } from 'styled-icons/boxicons-regular/ChevronLeft';
import { ChevronRight } from 'styled-icons/boxicons-regular/ChevronRight';
import { textRegularLineHeight } from '../../components/Typography';
import theme from '../../theme';
import { AppState } from '../../types';
import * as select from '../selectors';
import { ArchiveTreeSection, Book, Page } from '../types';
import ContentLink from './ContentLink';
import { contentTextStyle } from './Page';

const prevNextIconStyles = css`
  height: ${textRegularLineHeight}rem;
  width: ${textRegularLineHeight}rem;
`;

// tslint:disable-next-line:variable-name
const LeftArrow = styled(ChevronLeft)`
  ${prevNextIconStyles}
`;

// tslint:disable-next-line:variable-name
const RightArrow = styled(ChevronRight)`
  ${prevNextIconStyles}
`;

// tslint:disable-next-line:variable-name
const HidingContentLink: React.SFC<{book: Book; page?: ArchiveTreeSection}> = ({page, ...props}) => page !== undefined
  ? <ContentLink {...props} page={page} />
  : <span aria-hidden />;

// tslint:disable-next-line:variable-name
const BarWrapper = styled.div`
  ${contentTextStyle}
  justify-content: space-between;
  height: 4rem;
  display: flex;
  align-items: center;
  margin: 5rem auto 4rem auto;
  border-top: solid 0.1rem ${theme.color.neutral.darkest};
  border-bottom: solid 0.1rem ${theme.color.neutral.darkest};

  a {
    border: none;
  }

  ${theme.breakpoints.mobile(css`
    margin: 3.5rem auto 3.7rem auto;
    border: 0;
  `)}
`;

interface PropTypes {
  page?: Page;
  book?: Book;
  prevNext?: {
    prev?: ArchiveTreeSection;
    next?: ArchiveTreeSection;
  };
}

// tslint:disable-next-line:variable-name
export class PrevNextBar extends Component<PropTypes> {
  public render() {
    const {page, book, prevNext} = this.props;

    if (!book || !page || !prevNext) {
      return null;
    }

    return <BarWrapper>
      <FormattedMessage id='i18n:prevnext:prev:aria-label'>
        {(ariaLabel: Element | string) =>
        <HidingContentLink book={book} page={prevNext.prev} aria-label={ariaLabel}>
          <LeftArrow/>
          <FormattedMessage id='i18n:prevnext:prev:text'>
            {(msg: Element | string) => msg}
          </FormattedMessage>
        </HidingContentLink>
        }
      </FormattedMessage>

      <FormattedMessage id='i18n:prevnext:next:aria-label'>
        {(ariaLabel: Element | string) =>
        <HidingContentLink book={book} page={prevNext.next} aria-label={ariaLabel}>
          <FormattedMessage id='i18n:prevnext:next:text'>
            {(msg: Element | string) => msg}
          </FormattedMessage>
          <RightArrow/>
        </HidingContentLink>
        }
      </FormattedMessage>
    </BarWrapper>;
  }
}

export default connect(
  (state: AppState) => ({
    book: select.book(state),
    page: select.page(state),
    prevNext: select.prevNextPage(state),
  })
)(PrevNextBar);
