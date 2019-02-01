// tslint:disable:variable-name
import bookStyles from 'cnx-recipes/styles/output/intro-business.json';
import { ReactElement } from 'react';
import styled from 'styled-components';

const Hoc = ({children, className}: {className?: string, children: (className?: string) => ReactElement<any>}) =>
  children(className);

// Insert custom styles into ContentPane
export default styled(Hoc)`
  ${bookStyles}
`;
