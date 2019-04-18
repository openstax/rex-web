import { getBookStyles } from 'cnx-recipes';
import { ReactElement } from 'react';
import styled from 'styled-components/macro';
import { assertString } from '../../utils';

// tslint:disable-next-line:variable-name
const BookStylesHoC = (
  {children, className}: {className?: string, children: (className?: string) => ReactElement<any>}
) =>
  children(className);

const bookStyles = assertString(getBookStyles().get('intro-business'), 'missing book style: intro-business');

export default styled(BookStylesHoC)`
  ${bookStyles}
`;
