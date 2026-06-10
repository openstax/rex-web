import { HTMLElement } from '@openstax/types/lib.dom';
import classNames from 'classnames';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { linkColor, linkHover } from '../../../components/Typography';
import './TruncatedText.css';

interface Props {
  id: string;
  text: string;
  isActive: boolean;
  className?: string;
  onChange: () => void;
}

/**
 * Link component for "show more" functionality
 */
export function Link({ className, style, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      {...props}
      className={classNames('truncated-text-link', className)}
      style={{
        '--link-color': linkColor,
        '--link-hover-color': linkHover,
        ...style,
      } as React.CSSProperties}
    />
  );
}

/**
 * TruncatedText component - shows note text with expand/collapse functionality
 */
export function TruncatedText({ id, text, isActive, className, onChange }: Props) {
  const noteTextRef = React.useRef<HTMLElement>(null);
  const [showLink, setShowLink] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (noteTextRef.current && noteTextRef.current.scrollHeight > noteTextRef.current.offsetHeight) {
      setShowLink(true);
    } else {
      setShowLink(false);
    }
    onChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  return (
    <React.Fragment>
      <p
        id={id}
        ref={noteTextRef}
        className={classNames(
          'truncated-text-note',
          isActive ? 'active' : 'inactive',
          className
        )}
      >
        {text}
      </p>
      {showLink && (
        <FormattedMessage id='i18n:highlighting:card:show-more'>
          {(msg) => <Link>{msg}</Link>}
        </FormattedMessage>
      )}
    </React.Fragment>
  );
}

export default TruncatedText;
