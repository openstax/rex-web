export const assertWindow = (message: string = 'BUG: Window is undefined') => {
  if (typeof(window) === 'undefined') {
    throw new Error(message);
  }

  return window;
};

export const assertDocument = (message: string = 'BUG: Document is undefined') => {
  if (typeof(document) === 'undefined') {
    throw new Error(message);
  }

  return document;
};

export const assertDocumentElement = (message: string = 'BUG: Document Element is null') => {
  const documentElement = assertDocument().documentElement;

  if (documentElement === null) {
    throw new Error(message);
  }

  return documentElement;
};
