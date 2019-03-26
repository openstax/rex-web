// tslint:disable:variable-name
import { getBookStyles } from 'cnx-recipes';
import { ReactElement } from 'react';
import styled from 'styled-components';

const Hoc = ({children, className}: {className?: string, children: (className?: string) => ReactElement<any>}) =>
  children(className);

const styles = getBookStyles();
const bookStyles = styles.get('intro-business');

export default styled(Hoc)`
  ${bookStyles}
`;
