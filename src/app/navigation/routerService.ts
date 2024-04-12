import { findRouteMatch } from "./utils";
import { Location } from 'history';
import { AnyMatch, AnyRoute } from "./types";

export interface RouterService {
  findRoute: (input: Location | string) => AnyMatch | undefined;
}
 
export const createRouterService = (routes: AnyRoute[]): RouterService => ({
 findRoute: (input) => findRouteMatch(routes, input)
})
