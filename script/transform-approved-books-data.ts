import semverSort from 'semver-sort';
import { argv } from 'yargs';
import { assertNotNull } from '../src/app/utils';
import { REACT_APP_ARCHIVE_URL } from '../src/config';
import configuredBooks from '../src/config.books';

interface BookData {
  uuid: string;
  slug: string;
}

const isBookData = (something: any): something is BookData => {
  return typeof something.uuid === 'string' && typeof something.slug === 'string';
};

interface ApprovedBooksData_v1 {
  style: string;
  tutor_only: boolean;
  books: BookData[];
}

const isApprovedBooksData_v1 = (something: any): something is ApprovedBooksData_v1 => {
  return typeof something.style === 'string'
    && typeof something.tutor_only === 'boolean'
    && Array.isArray(something.books)
    && something.books.every(isBookData);
};

interface ApprovedCollection_v1 extends ApprovedBooksData_v1 {
  collection_id: string;
  server: string;
}

const isApprovedCollection_v1 = (something: any): something is ApprovedCollection_v1 => {
  return typeof something.collection_id === 'string'
    && typeof something.server === 'string'
    && isApprovedBooksData_v1(something);
};

interface ApprovedRepo_v1 extends ApprovedBooksData_v1 {
  repository_name: string;
}

const isApprovedRepo_v1 = (something: any): something is ApprovedRepo_v1 => {
  return typeof something.repository_name === 'string' && isApprovedBooksData_v1(something);
};

interface ApprovedVersion_v1 {
  content_version: string;
  min_code_version: string;
}

const isApprovedVersion_v1 = (something: any): something is ApprovedVersion_v1 => {
  return typeof something.content_version === 'string' && typeof something.min_code_version === 'string';
};

interface ApprovedVersionCollection_v1 extends ApprovedVersion_v1 {
  collection_id: string;
}

const isApprovedVersionCollection_v1 = (something: any): something is ApprovedVersionCollection_v1 => {
  return typeof something.collection_id === 'string' && isApprovedVersion_v1(something);
};

interface ApprovedVersionRepo_v1 extends ApprovedVersion_v1 {
  repository_name: string;
}

const isApprovedVersionRepo_v1 = (something: any): something is ApprovedVersionRepo_v1 => {
  return typeof something.repository_name === 'string' && isApprovedVersion_v1(something);
};

interface ApprovedBooksAndVersions_v1 {
  approved_books: Array<ApprovedCollection_v1 | ApprovedRepo_v1>;
  approved_versions: Array<ApprovedVersionCollection_v1 | ApprovedVersionRepo_v1>;
}

const isApprovedBooksAndVersions_v1 = (something: any): something is ApprovedBooksAndVersions_v1 => {
  return Array.isArray(something.approved_books)
    && something.approved_books.every(
      (element: any) => isApprovedCollection_v1(element) || isApprovedRepo_v1(element))
    && something.approved_versions.every(
      (element: any) => isApprovedVersionCollection_v1(element) || isApprovedVersionRepo_v1(element));
};

const matchRepoVersion_v1 = (repoData: ApprovedRepo_v1, archiveVersion?: string) =>
  (versionData: ApprovedVersionCollection_v1 | ApprovedVersionRepo_v1): versionData is ApprovedVersionRepo_v1 => {
  if (archiveVersion && versionData.min_code_version > archiveVersion) { return false; }
  return isApprovedVersionRepo_v1(versionData) && versionData.repository_name === repoData.repository_name;
};

const matchCollectionVersion_v1 = (collectionData: ApprovedCollection_v1, archiveVersion?: string) =>
  (versionData: ApprovedVersionCollection_v1 | ApprovedVersionRepo_v1): versionData is ApprovedVersionCollection_v1 => {
  if (archiveVersion && versionData.min_code_version > archiveVersion) { return false; }
  return isApprovedVersionCollection_v1(versionData) && versionData.collection_id === collectionData.collection_id;
};

const getDesiredVersion_v1 = (
  approvedVersions: Array<ApprovedVersionCollection_v1 | ApprovedVersionRepo_v1>,
  colOrRepo: ApprovedRepo_v1 | ApprovedCollection_v1
): string | undefined => {
  // Example archive code version: 20210224.204120
  const archiveVersion = assertNotNull(
    REACT_APP_ARCHIVE_URL.match(/[0-9]+\.[0-9]+/),
    'REACT_APP_ARCHIVE_URL does not contain valid code version'
  )[0];

  const [filter, transformVersion, sortFunction] = isApprovedCollection_v1(colOrRepo)
    ? [
      matchCollectionVersion_v1(colOrRepo, archiveVersion),
      (version: string) => version.slice(2),
      semverSort.desc,
    ]
    : [
      matchRepoVersion_v1(colOrRepo, archiveVersion),
      (version: string) => version,
      (array: string[]) => array.sort().reverse(),
    ];

  // only versions for current repo / collection and current archive code version
  const filteredVersions = approvedVersions
    .filter(filter)
    .map((data) => data.content_version);

  // sorted from the highest to the lowest version
  const sorted = sortFunction(filteredVersions);

  // collections are using semantic versioning so we are removing first 2 characters
  const transformed = sorted.map(transformVersion);

  // we want the most recent one
  return transformed[0];
};

const transformData_v1 = (data: ApprovedBooksAndVersions_v1): { [key: string]: string } => {
  const results: { [key: string]: string } = {};

  const { approved_books, approved_versions } = data;

  for (const collectionOrRepo of approved_books) {
    if (
      collectionOrRepo.tutor_only
      || (isApprovedCollection_v1(collectionOrRepo) && collectionOrRepo.server !== 'cnx.org')
    ) {
      continue;
    }

    const books = collectionOrRepo.books;
    const desiredVersion = getDesiredVersion_v1(approved_versions, collectionOrRepo);

    if (!desiredVersion) {
      // Skip if we couldn't find the version matching currently used archive version
      continue;
    }

    for (const book of books) {
      if (!configuredBooks[book.uuid] || configuredBooks[book.uuid].defaultVersion !== desiredVersion) {
        results[book.uuid] = desiredVersion;
      }
    }
  }

  return results;
}

const transformData = () => {
  const { data } = argv as { data?: string };

  if (!data) {
    throw new Error('data argument is missing');
  }

  let parsed: ApprovedBooksAndVersions_v1;
  let results;
  try {
    parsed = JSON.parse(data);
    if (isApprovedBooksAndVersions_v1(parsed)) {
      results = transformData_v1(parsed)
    } else {
      throw new Error('Data is valid JSON, but has wrong structure. See ApprovedBooksAndVersions interface.');
    }
  } catch (e) {
    throw new Error(`Error while parsing data. Details: ${e}`);
  }

  // this script is used in the update-content/script.bash
  // so we write results to the terminal to assign them to a variable
  process.stdout.write(JSON.stringify(results));
  return results
};

transformData();
