export const acceptStatus = (
  status: number,
  formatError: (status: number, message: string) => string
) => (response: Response): Promise<Response> | Promise<never> => {

  if (response.status !== status) {
    return response.text().then((message: string) => {
      throw new Error(formatError(response.status, message));
    });
  }
  return Promise.resolve(response);
};
