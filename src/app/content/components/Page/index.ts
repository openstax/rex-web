import flow from 'lodash/fp/flow';
import { injectIntl } from 'react-intl';
import styled from 'styled-components/macro';
import withServices from '../../../context/Services';
import connector from './connector';
import PageComponent from './PageComponent';
import stylePage from './style';

export { contentTextStyle } from './style';
export { default as PageComponent } from './PageComponent';

// tslint:disable-next-line:variable-name
const StyledPageComponent = styled(PageComponent)`
  ${stylePage}
`;

export default flow(
  injectIntl,
  withServices,
  connector
)(StyledPageComponent);
