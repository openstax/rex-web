import { MyPlacement } from '@openstax/placements';
import { createStandardAction } from 'typesafe-actions';

export const receiveMyPlacements = createStandardAction(
  'Content/Placements/receive'
)<{myPlacements: MyPlacement[]}>();
