export const assertWindow = (message = 'BUG: Window is undefined') => {
  if (typeof(window) === 'undefined') {
    throw new Error(message);
  }

  return window;
};

export const assertDocument = (message = 'BUG: Document is undefined') => {
  if (typeof(document) === 'undefined') {
    throw new Error(message);
  }

  return document;
};

export const assertDocumentElement = (message = 'BUG: Document Element is null') => {
  const documentElement = assertDocument().documentElement;

  if (documentElement === null) {
    throw new Error(message);
  }

  return documentElement;
};
