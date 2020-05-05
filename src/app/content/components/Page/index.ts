import flow from 'lodash/fp/flow';
import { injectIntl } from 'react-intl';
import withServices from '../../../context/Services';
import connector from './connector';
import PageComponent from './PageComponent';

export { contentTextStyle } from './PageContent';
export { default as PageComponent } from './PageComponent';

export default flow(
  injectIntl,
  withServices,
  connector
)(PageComponent);
