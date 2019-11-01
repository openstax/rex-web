declare module 'scroll-to-element' {

  interface Options {
    align?: 'top' | 'middle' | 'bottom';
    offset?: number;
  }

  export default function scrolltoElement(e: Element, options?: Options): void;
}
