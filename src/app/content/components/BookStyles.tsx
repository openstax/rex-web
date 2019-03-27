// tslint:disable:variable-name
import { getBookStyles } from 'cnx-recipes';
import { ReactElement } from 'react';
import styled from 'styled-components';
import { assertString } from '../../utils';

const Hoc = ({children, className}: {className?: string, children: (className?: string) => ReactElement<any>}) =>
  children(className);

const bookStyles = assertString(getBookStyles().get('intro-business'), 'missing book style: intro-business');

export default styled(Hoc)`
  ${bookStyles}
`;
