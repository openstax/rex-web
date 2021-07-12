import { MyPlacement } from '@openstax/placements';

export interface Config {
  type: String;
}

export interface ContentBottomConfig extends Config {
  url: String;
  title: String;
  blurb: String;
  button: String;
}

export interface State {
  myPlacements: null | MyPlacement[];
}
