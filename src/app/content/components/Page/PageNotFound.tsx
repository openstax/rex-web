import React from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import theme from '../../../theme';
import { StyledOpenTOCControl } from '../SidebarControl';
import './PageNotFound.css';

/**
 * PageNotFound component - Displays 404 error page
 *
 * Migrated from styled-components to plain CSS.
 */
function PageNotFound() {
  return (
    <div
      className={classNames('page-not-found-wrapper')}
      style={{
        '--text-color': theme.color.primary.gray.base,
      } as React.CSSProperties}
    >
      <h1 className={classNames('page-not-found-title')}>
        <FormattedMessage id='i18n:page-not-found:heading'>
          {(msg) => msg}
        </FormattedMessage>
      </h1>
      <div className={classNames('page-not-found-text')}>
        <span>
          <FormattedMessage id='i18n:page-not-found:text-before-button'>
            {(msg) => msg}
          </FormattedMessage>
        </span>
        <StyledOpenTOCControl />
      </div>
    </div>
  );
}

export default PageNotFound;
