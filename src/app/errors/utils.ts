export const getNewErrorStack = (stack: string[], id?: string) => {
  if (!id) {
    return stack;
  }

  return [id, ...stack];
};
