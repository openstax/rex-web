import React, { ComponentType, HTMLAttributes } from 'react';
import { useIntl } from 'react-intl';

type Type = <T extends object>(messageKey: string, Component: ComponentType<HTMLAttributes<T>>) =>
  ComponentType<{values?: Record<string, Date | string | number | null>} & HTMLAttributes<T>>;

export const htmlMessage: Type = (messageKey, Component) => ({values, ...props}) =>
  <Component
    {...props}
    dangerouslySetInnerHTML={{__html:
      useIntl().formatMessage({id: messageKey}, values, {ignoreTag: true}),
    }}
  />
;

export default htmlMessage;
