
export default (url: string) => new Promise((resolve) => {
  if (!document || !document.head) {
    return;
  }
  const link = document.createElement('link');
  link.setAttribute('rel', 'stylesheet');
  link.setAttribute('href', url);
  link.onload = resolve;
  document.head.appendChild(link);
});
