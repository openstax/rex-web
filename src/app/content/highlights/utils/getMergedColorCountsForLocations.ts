import { ColorCounts, HighlightsTotalCountsPerLocation } from '../types';
import reduceColorCounts from './reduceColorCounts';

const getMergedColorCountsForLocations = (totalCounts: HighlightsTotalCountsPerLocation, locations: string[]) => {
  let mergedColorCounts = {} as ColorCounts;

  for (const [locationId, counts] of Object.entries(totalCounts)) {
    if (locations.includes(locationId)) {
      mergedColorCounts = reduceColorCounts({...mergedColorCounts}, counts);
    }
  }

  return mergedColorCounts;
};

export default getMergedColorCountsForLocations;
