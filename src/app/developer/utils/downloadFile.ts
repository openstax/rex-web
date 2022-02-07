import { assertDocument } from '../../utils/browser-assertions';

// mostly from https://stackoverflow.com/a/18197341/14809536
export const downloadFile = (filename: string, text: string) => {
  const document = assertDocument();
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
};
