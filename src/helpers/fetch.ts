export type FormatError = (status: number, message: string) => Error;

export const rejectResponse = (response: Response, formatError: FormatError) =>
  response.text().then((message: string) => {
    throw formatError(response.status, message);
  });

export const acceptStatus = (
  status: number,
  formatError: FormatError
) => (response: Response): Promise<Response> | Promise<never> => {

  if (response.status !== status) {
    return rejectResponse(response, formatError);
  }
  return Promise.resolve(response);
};
