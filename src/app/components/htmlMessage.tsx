import React, { ComponentType, HTMLAttributes } from 'react';
import { FormattedHTMLMessage } from 'react-intl';
import { assertString } from '../utils';

type Props = Pick<React.ComponentProps<typeof FormattedHTMLMessage>, 'values'> & { messageKey?: string };

// tslint:disable-next-line:variable-name
type Type = <T extends any>(msgKey: string, Component: ComponentType<HTMLAttributes<T>>) =>
  ComponentType<Props & HTMLAttributes<T>>;

// Allow overriding msgKey passed to htmlMessage by passing messageKey as a prop to the returned component
// tslint:disable-next-line:variable-name
const htmlMessage: Type = (msgKey, Component) => ({values, messageKey, ...props}) =>
  <FormattedHTMLMessage id={messageKey || msgKey} values={values ? values : {}}>
    {(msg: string | Element) =>
      <Component
        dangerouslySetInnerHTML={{__html: assertString(msg, `${messageKey || msgKey} must be a string`)}}
        {...props}
      />
    }
  </FormattedHTMLMessage>
;

export default htmlMessage;
