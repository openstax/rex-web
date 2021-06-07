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

interface ApprovedBooksData {
  style: string;
  tutor_only: boolean;
  books: BookData[];
}

const isApprovedBooksData = (something: any): something is ApprovedBooksData => {
  return typeof something.style === 'string'
    && typeof something.tutor_only === 'boolean'
    && Array.isArray(something.books)
    && something.books.every(isBookData);
};

interface ApprovedCollection extends ApprovedBooksData {
  collection_id: string;
  server: string;
}

const isApprovedCollection = (something: any): something is ApprovedCollection => {
  return typeof something.collection_id === 'string'
    && typeof something.server === 'string'
    && isApprovedBooksData(something);
};

interface ApprovedRepo extends ApprovedBooksData {
  repo: string;
}

const isApprovedRepo = (something: any): something is ApprovedRepo => {
  return typeof something.repo === 'string' && isApprovedBooksData(something);
};

interface ApprovedVersion {
  content_version: string;
  min_code_version: string;
}

const isApprovedVersion = (something: any): something is ApprovedVersion => {
  return typeof something.content_version === 'string' && typeof something.min_code_version === 'string';
};

interface ApprovedVersionCollection extends ApprovedVersion {
  collection_id: string;
}

const isApprovedVersionCollection = (something: any): something is ApprovedVersionCollection => {
  return typeof something.collection_id === 'string' && isApprovedVersion(something);
};

interface ApprovedVersionRepo extends ApprovedVersion {
  repo: string;
}

const isApprovedVersionRepo = (something: any): something is ApprovedVersionRepo => {
  return typeof something.repo === 'string' && isApprovedVersion(something);
};

interface ApprovedBooksAndVersions {
  approved_books: Array<ApprovedCollection | ApprovedRepo>;
  approved_versions: Array<ApprovedVersionCollection | ApprovedVersionRepo>;
}

const isApprovedBooksAndVersions = (something: any): something is ApprovedBooksAndVersions => {
  return Array.isArray(something.approved_books)
    && something.approved_books.every(
      (element: any) => isApprovedCollection(element) || isApprovedRepo(element))
    && something.approved_versions.every(
      (element: any) => isApprovedVersionCollection(element) || isApprovedVersionRepo(element));
};

const matchRepoVersion = (repoData: ApprovedRepo, archiveVersion?: string) =>
  (versionData: ApprovedVersionCollection | ApprovedVersionRepo): versionData is ApprovedVersionRepo => {
  if (archiveVersion && versionData.min_code_version > archiveVersion) { return false; }
  return isApprovedVersionRepo(versionData) && versionData.repo === repoData.repo;
};

const matchCollectionVersion = (collectionData: ApprovedCollection, archiveVersion?: string) =>
  (versionData: ApprovedVersionCollection | ApprovedVersionRepo): versionData is ApprovedVersionCollection => {
  if (archiveVersion && versionData.min_code_version > archiveVersion) { return false; }
  return isApprovedVersionCollection(versionData) && versionData.collection_id === collectionData.collection_id;
};

const getDesiredVersion = (
  approvedVersions: Array<ApprovedVersionCollection | ApprovedVersionRepo>,
  colOrRepo: ApprovedRepo | ApprovedCollection
): string | undefined => {
  // Example archive code version: 20210224.204120
  const archiveVersion = assertNotNull(
    REACT_APP_ARCHIVE_URL.match(/[0-9]+\.[0-9]+/),
    'REACT_APP_ARCHIVE_URL does not contain valid code version'
  )[0];

  const [filter, transformVersion, sortFunction] = isApprovedCollection(colOrRepo)
    ? [
      matchCollectionVersion(colOrRepo, archiveVersion),
      (version: string) => version.slice(2),
      semverSort.desc,
    ]
    : [
      matchRepoVersion(colOrRepo, archiveVersion),
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

const transformData = () => {
  const { data } = argv as { data?: string };

  if (!data) {
    throw new Error('data argument is missing');
  }

  let parsed: ApprovedBooksAndVersions;
  try {
    parsed = JSON.parse(data);
    if (!isApprovedBooksAndVersions(parsed)) {
      throw new Error('Data is valid JSON, but has wrong structure. See ApprovedBooksAndVersions interface.');
    }
  } catch (e) {
    throw new Error(`Error while parsing data. Details: ${e}`);
  }

  const results: { [key: string]: string } = {};

  const { approved_books, approved_versions } = parsed;

  for (const collectionOrRepo of approved_books) {
    if (
      collectionOrRepo.tutor_only
      || (isApprovedCollection(collectionOrRepo) && collectionOrRepo.server !== 'cnx.org')
    ) {
      continue;
    }

    const books = collectionOrRepo.books;
    const desiredVersion = getDesiredVersion(approved_versions, collectionOrRepo);

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

  // this script is used in the update-content/script.bash
  // so we write results to the terminal to assign them to a variable
  process.stdout.write(JSON.stringify(results));
  return results;
};

transformData();
