
export type Meta = {property: string; content: string} | {name: string; content: string; };
export type Link = {rel: 'canonical', href: string}

export interface State {
  title: string;
  meta: Meta[];
  link: Link[];
}
