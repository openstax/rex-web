import React, { ComponentType, HTMLAttributes } from 'react';
import { useIntl } from 'react-intl';

// tslint:disable-next-line:variable-name
type Type = <T extends any>(messageKey: string, Component: ComponentType<HTMLAttributes<T>>) =>
  ComponentType<{values?: Record<string, any>} & HTMLAttributes<T>>;

// tslint:disable-next-line:variable-name
export const htmlMessage: Type = (messageKey, Component) => ({values, ...props}) =>
  <Component
    {...props}
    dangerouslySetInnerHTML={{__html:
      useIntl().formatMessage({id: messageKey}, values, {ignoreTag: true}),
    }}
  />
;

export default htmlMessage;
