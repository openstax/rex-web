import {
  MyPlacement,
} from '@openstax/placements';

import { assertDefined } from '../../utils';
import { AppServices } from '../../types';

export const loadMyPlacements = async({
  placementsClient,
}: {
  placementsClient: AppServices['placementsClient'];
}): Promise<MyPlacement[]> => {
  const myPlacementsResponse = await placementsClient.getMyPlacements({
    host: "rex",
  });

  return assertDefined(myPlacementsResponse.data, 'response from placements api is invalid');
};
