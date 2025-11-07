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
  width: max-content;
  max-width: 100%;
  flex-shrink: 0;
  font-size: 1.4rem;
  color: ${theme.color.primary.gray.light};
  padding: 2.5rem 0;
  text-decoration: none;

  > span {
    color: ${linkColor};

    &::before {
      content: " ";
    }
  }

  ${theme.breakpoints.mobile(css`
    padding: 1.2rem;
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
      {(msg) => msg}
    </FormattedMessage>
    <span dangerouslySetInnerHTML={{ __html: section.title }} />
  </StyledLink>;
};

export default LinkToSection;
