import { argv } from 'yargs';
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

const matchRepoVersion = (repoData: ApprovedRepo) =>
  (versionData: ApprovedVersionCollection | ApprovedVersionRepo): versionData is ApprovedVersionRepo => {
  return isApprovedVersionRepo(versionData) && versionData.repo === repoData.repo;
};

const matchCollectionVersion = (collectionData: ApprovedCollection) =>
  (versionData: ApprovedVersionCollection | ApprovedVersionRepo): versionData is ApprovedVersionCollection => {
  return isApprovedVersionCollection(versionData) && versionData.collection_id === collectionData.collection_id;
};

const getDesiredVersion = (
  approvedVersions: Array<ApprovedVersionCollection | ApprovedVersionRepo>,
  colOrRepo: ApprovedRepo | ApprovedCollection
): string | undefined => {
  const isCollection = isApprovedCollection(colOrRepo);
  const versions = approvedVersions
    // only versions for current repo
    .filter(isApprovedRepo(colOrRepo) ? matchRepoVersion(colOrRepo) : matchCollectionVersion(colOrRepo))
    .map((versionData) => {
      // books from collections have versions starting with 1.
      return isCollection ? versionData.content_version.slice(2) : versionData.content_version;
    })
    // sort and revert so results are descending
    .sort()
    .reverse();

  // in general we want the most recent one, in the future we'll have to filter this by which ones
  // are available for the recipe code version REX supports
  return versions[0];
};

const { data } = argv as { data?: string };

const transformData = () => {
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
    const books = collectionOrRepo.books;
    const desiredVersion = getDesiredVersion(approved_versions, collectionOrRepo);

    if (!desiredVersion) {
      throw new Error(`Couldn't find version for ${
        isApprovedRepo(collectionOrRepo)
          ? `repo ${collectionOrRepo.repo}`
          : `collection ${collectionOrRepo.collection_id}`
      }`);
    }

    for (const book of books) {
      if (!configuredBooks[book.uuid] || configuredBooks[book.uuid].defaultVersion !== desiredVersion) {
        results[book.uuid] = desiredVersion;
      }
    }
  }

  // this script is used in a update-content/script.bash
  // so we write results to the terminal to assign them to a variable
  // tslint:disable-next-line: no-console
  console.log(JSON.stringify(results));
  return results;
};

transformData();
