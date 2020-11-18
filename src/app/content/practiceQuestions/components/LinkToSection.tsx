import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import { linkColor } from '../../../components/Typography';
import theme from '../../../theme';
import * as contentSelectors from '../../selectors';
import { LinkedArchiveTreeSection } from '../../types';
import { getBookPageUrlAndParams } from '../../utils/urlUtils';

// tslint:disable-next-line: variable-name
export const StyledContentLink = styled.a`
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

  const linkToTheSection = React.useMemo(() => {
    return book && section ? getBookPageUrlAndParams(book, section).url : null;
  }, [book, section]);

  if (!section || !linkToTheSection) { return null; }

  return <StyledContentLink href={linkToTheSection} target='_blank' data-analytics-label='Go to link' >
    <FormattedMessage id='i18n:practice-questions:popup:read'>
      {(msg: string) => msg}
    </FormattedMessage>
    <span dangerouslySetInnerHTML={{ __html: section.title }} />
  </StyledContentLink>;
};

export default LinkToSection;
