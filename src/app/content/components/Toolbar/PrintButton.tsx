import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import * as selectNavigation from '../../../navigation/selectors';
import { AppState } from '../../../types';
import { assertWindow } from '../../../utils';
import * as select from '../../selectors';
import { Book } from '../../types';
import * as Styled from './styled';

interface Props {
  currentPath: string;
  book: Book | undefined;
  className?: string;
}

class PrintButton extends Component<Props> {
  public render() {
    return (
      <FormattedMessage id='i18n:toolbar:print:text'>
        {(msg: Element | string) => (
          <FormattedMessage id='i18n:toolbar:print:aria-label'>
            {(label: Element | string) => (
              <Styled.PrintOptWrapper
                onClick={() => assertWindow().print()}
                aria-label={label}
                data-testid='print'
                className={this.props.className}
              >
                <Styled.PrintIcon />
                <Styled.PrintOptions>{msg}</Styled.PrintOptions>
              </Styled.PrintOptWrapper>
            )}
          </FormattedMessage>
        )}
      </FormattedMessage>
    );
  }
}

export default connect((state: AppState) => ({
  ...select.bookAndPage(state),
  currentPath: selectNavigation.pathname(state),
}))(PrintButton);
