
export const hasParams = <P>(payload: any & {params?: P}): payload is {params: Exclude<P, undefined>} =>
  payload.params !== undefined;

export const hasState = (payload: any & {state?: object}): payload is {state: object} =>
  payload.state !== undefined;
