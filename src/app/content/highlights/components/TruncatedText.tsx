import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled, { css } from 'styled-components/macro';
import { linkStyle } from '../../../components/Typography';
import { textStyle } from '../../../components/Typography/base';
import theme from '../../../theme';
import { cardPadding } from '../constants';

interface Props {
  text: string;
  isFocused: boolean;
  className?: string;
}

// tslint:disable-next-line:variable-name
const Link = styled.span`
  ${textStyle}
  ${linkStyle}
  text-align: left;
  cursor: pointer;
  border: none;
  padding: 0;
  margin: ${cardPadding / 2}rem 0 0 0;
  background: none;
  font-size: 1.2rem;
  line-height: 1.6rem;
`;

// tslint:disable-next-line:variable-name
const NoteText = ({text, isFocused, className}: Props) => {
  const noteTextRef = React.useRef<HTMLElement>(null);
  const [showLink, setShowLink] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (noteTextRef.current && noteTextRef.current.scrollHeight > noteTextRef.current.offsetHeight) {
      setShowLink(true);
    } else {
      setShowLink(false);
    }
  }, [isFocused]);

  return <React.Fragment>
    <p ref={noteTextRef} className={className}>{text}</p>
    {showLink && <FormattedMessage id='show more'>
      {(msg: Element | string) => <Link>{msg}</Link>}
    </FormattedMessage>}
  </React.Fragment>;
};

const lineHeight = 1.8;
export default styled(NoteText)`
  ${textStyle}
  font-size: 1.4rem;
  line-height: ${lineHeight}rem;
  margin: 0;
  padding: 0;

  ${(props: Props) => props.isFocused && css`
    + ${Link} {
      display: none;
    }
  `}
  ${(props: Props) => !props.isFocused && css`
    text-overflow: ellipsis;
    overflow: hidden;
    max-height: ${lineHeight * 3}rem;
    white-space: normal;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
  `}

  ${theme.breakpoints.mobile(css`
    padding: ${cardPadding}rem ${cardPadding * 2}rem;
    height: 15.2rem;
    overflow: auto;
  `)}
`;
