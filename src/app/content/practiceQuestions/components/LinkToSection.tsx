import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import { linkColor } from '../../../components/Typography';
import theme from '../../../theme';
import ContentLink from '../../components/ContentLink';
import * as contentSelectors from '../../selectors';
import { LinkedArchiveTreeSection } from '../../types';

// tslint:disable-next-line: variable-name
export const StyledLink = styled(ContentLink)`
  display: block;
  font-size: 1.4rem;
  color: #929292;
  margin-top: 2.5rem;
  text-decoration: none;

  > span {
    color: ${linkColor};

    &::before {
      content: " ";
    }
  }

  ${theme.breakpoints.mobile(css`
    margin: 1.2rem;
  `)}
`;

interface LinkToSectionProps {
  section: LinkedArchiveTreeSection | null;
}

// tslint:disable-next-line: variable-name
const LinkToSection = ({ section }: LinkToSectionProps) => {
  const book = useSelector(contentSelectors.book);

  if (!section) { return null; }

  return <StyledLink book={book} page={section} target='_blank' data-analytics-label='Go to link' >
    <FormattedMessage id='i18n:practice-questions:popup:read'>
      {(msg: string) => msg}
    </FormattedMessage>
    <span dangerouslySetInnerHTML={{ __html: section.title }} />
  </StyledLink>;
};

export default LinkToSection;
