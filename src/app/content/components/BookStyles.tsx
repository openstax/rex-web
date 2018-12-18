// tslint:disable:variable-name
import bookStyles from 'cnx-recipes/styles/output/intro-business.json';
import { ReactElement } from 'react';
import styled from 'styled-components';

const Hoc = ({children, className}: {className?: string, children: (className?: string) => ReactElement<any>}) =>
  children(className);

export default styled(Hoc)`
  ${bookStyles}
  /* Occur later so the bookstyles do not bleed below (e.g. @page) */
  *:target { 
    background-color: #ffffdd; 
  }
`;
