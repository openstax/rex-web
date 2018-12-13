// tslint:disable:variable-name
import styled from '@emotion/styled/macro';
import bookStyles from 'cnx-recipes/styles/output/intro-business.json';
import { ReactElement } from 'react';

const Hoc = ({children, className}: {className?: string, children: (className?: string) => ReactElement<any>}) =>
  children(className);

export default styled(Hoc)`
  ${bookStyles}
`;
