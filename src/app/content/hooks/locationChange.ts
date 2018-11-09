import { routeHook } from '../../navigation/utils';
import { content } from '../routes';

export default routeHook(content, ({dispatch, getState}) => ({match}) => {
  console.log(dispatch, getState(), match.params); // tslint:disable-line:no-console
});
