import semverSort from 'semver-sort';
import { argv } from 'yargs';
import { assertNotNull } from '../src/app/utils';
import { REACT_APP_ARCHIVE_URL } from '../src/config';
import configuredBooks from '../src/config.books';

// Example archive code version: 20210224.204120
const archiveVersion = assertNotNull(
  REACT_APP_ARCHIVE_URL.match(/[0-9]+\.[0-9]+/),
  'REACT_APP_ARCHIVE_URL does not contain valid code version'
)[0];

interface BookData {
  uuid: string;
  slug: string;
}

const isBookData = (something: any): something is BookData => {
  return typeof something.uuid === 'string' && typeof something.slug === 'string';
};

interface ApprovedBooksDataVer1 {
  style: string;
  tutor_only: boolean;
  books: BookData[];
}

const isApprovedBooksDataVer1 = (something: any): something is ApprovedBooksDataVer1 => {
  return typeof something.style === 'string'
    && typeof something.tutor_only === 'boolean'
    && Array.isArray(something.books)
    && something.books.every(isBookData);
};

interface ApprovedCollectionVer1 extends ApprovedBooksDataVer1 {
  collection_id: string;
  server: string;
}

const isApprovedCollectionVer1 = (something: any): something is ApprovedCollectionVer1 => {
  return typeof something.collection_id === 'string'
    && typeof something.server === 'string'
    && isApprovedBooksDataVer1(something);
};

interface ApprovedRepoVer1 extends ApprovedBooksDataVer1 {
  repository_name: string;
}

const isApprovedRepoVer1 = (something: any): something is ApprovedRepoVer1 => {
  return typeof something.repository_name === 'string' && isApprovedBooksDataVer1(something);
};

interface ApprovedVersionVer1 {
  content_version: string;
  min_code_version: string;
}

const isApprovedVersionVer1 = (something: any): something is ApprovedVersionVer1 => {
  return typeof something.content_version === 'string' && typeof something.min_code_version === 'string';
};

interface ApprovedVersionCollectionVer1 extends ApprovedVersionVer1 {
  collection_id: string;
}

const isApprovedVersionCollectionVer1 = (something: any): something is ApprovedVersionCollectionVer1 => {
  return typeof something.collection_id === 'string' && isApprovedVersionVer1(something);
};

interface ApprovedVersionRepoVer1 extends ApprovedVersionVer1 {
  repository_name: string;
}

const isApprovedVersionRepoVer1 = (something: any): something is ApprovedVersionRepoVer1 => {
  return typeof something.repository_name === 'string' && isApprovedVersionVer1(something);
};

interface ApprovedBooksAndVersionsVer1 {
  approved_books: Array<ApprovedCollectionVer1 | ApprovedRepoVer1>;
  approved_versions: Array<ApprovedVersionCollectionVer1 | ApprovedVersionRepoVer1>;
}

const isApprovedBooksAndVersionsVer1 = (something: any): something is ApprovedBooksAndVersionsVer1 => {
  return Array.isArray(something.approved_books)
    && something.approved_books.every(
      (element: any) => isApprovedCollectionVer1(element) || isApprovedRepoVer1(element))
    && something.approved_versions.every(
      (element: any) => isApprovedVersionCollectionVer1(element) || isApprovedVersionRepoVer1(element));
};

enum ApprovedPlatformKindVer2 {
  REX = 'REX',
  Tutor = 'TUTOR',
}

type ApprovedPlatformVer2 = ApprovedPlatformKindVer2.REX | ApprovedPlatformKindVer2.Tutor;

const isApprovedPlatformVer2 = (str: string) => {
  return str === ApprovedPlatformKindVer2.REX || str === ApprovedPlatformKindVer2.Tutor;
};

interface ApprovedRepoVer2 {
  repository_name: string;
  platforms: ApprovedPlatformVer2[];
  versions: ApprovedRepoVersionVer2[];
}

const isApprovedRepoVer2 = (something: any): something is ApprovedRepoVer2 => {
  return typeof something.repository_name === 'string'
    && Array.isArray(something.platforms)
    && something.platforms.every(
      (element: any) => isApprovedPlatformVer2(element)
    )
    && Array.isArray(something.versions)
    && something.versions.every(
      (element: any) => isApprovedRepoVersionVer2(element)
    );
};
interface ApprovedRepoVersionVer2 {
  min_code_version: string; // TODO: Since everyone is treating this as a number should this just become a number?
  edition: number;
  commit_sha: string;
  commit_metadata: {
    committed_at: string,
    books: ApprovedRepoVersionBookVer2[]
  };
}

const isApprovedRepoVersionVer2 = (something: any): something is ApprovedRepoVersionVer2 => {
  return typeof something.min_code_version === 'string'
    && typeof something.edition === 'number'
    && typeof something.commit_sha === 'string'
    && typeof something.commit_metadata === 'object'
    && typeof something.commit_metadata.committed_at === 'string'
    && Array.isArray(something.commit_metadata.books)
    && something.commit_metadata.books.every(
      (element: any) => isApprovedRepoVersionBookVer2(element)
    );
};

interface ApprovedRepoVersionBookVer2 {
  style: string;
  uuid: string;
  slug: string;
}

const isApprovedRepoVersionBookVer2 = (something: any): something is ApprovedRepoVersionBookVer2 => {
  return typeof something.style === 'string'
    && typeof something.uuid === 'string'
    && typeof something.slug === 'string';
};

interface ApprovedBooksAndVersionsVer2 {
  api_version: 2;
  approved_books: Array<ApprovedCollectionVer1 | ApprovedRepoVer2>;
  approved_versions: ApprovedVersionCollectionVer1[];
}

const isApprovedBooksAndVersionsVer2 = (something: any): something is ApprovedBooksAndVersionsVer2 => {
  return something.api_version === 2
    && Array.isArray(something.approved_books)
    && something.approved_books.every(
      (element: any) => isApprovedRepoVer2(element) || isApprovedCollectionVer1(element)
    )
    && Array.isArray(something.approved_versions)
    && something.approved_versions.every(
      (element: any) => isApprovedVersionVer1(element)
    );
};

const matchRepoVersionVer1 = (repoData: ApprovedRepoVer1) =>
  (versionData: ApprovedVersionCollectionVer1 | ApprovedVersionRepoVer1): versionData is ApprovedVersionRepoVer1 => {
  if (archiveVersion && versionData.min_code_version > archiveVersion) { return false; }
  return isApprovedVersionRepoVer1(versionData) && versionData.repository_name === repoData.repository_name;
};

const matchCollectionVersionVer1 = (collectionData: ApprovedCollectionVer1) =>
  (versionData: ApprovedVersionCollectionVer1 | ApprovedVersionRepoVer1):
  versionData is ApprovedVersionCollectionVer1 => {
  if (archiveVersion && versionData.min_code_version > archiveVersion) { return false; }
  return isApprovedVersionCollectionVer1(versionData) && versionData.collection_id === collectionData.collection_id;
};

const getDesiredVersionVer1 = (
  approvedVersions: Array<ApprovedVersionCollectionVer1 | ApprovedVersionRepoVer1>,
  colOrRepo: ApprovedRepoVer1 | ApprovedCollectionVer1
): string | undefined => {
  const [filter, transformVersion, sortFunction] = isApprovedCollectionVer1(colOrRepo)
    ? [
      matchCollectionVersionVer1(colOrRepo),
      (version: string) => version.slice(2),
      semverSort.desc,
    ]
    : [
      matchRepoVersionVer1(colOrRepo),
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

const transformDataVer1 = (data: ApprovedBooksAndVersionsVer1): { [key: string]: string } => {
  const results: { [key: string]: string } = {};

  const { approved_books, approved_versions } = data;

  for (const collectionOrRepo of approved_books) {
    if (
      collectionOrRepo.tutor_only
      || (isApprovedCollectionVer1(collectionOrRepo) && collectionOrRepo.server !== 'cnx.org')
    ) {
      continue;
    }

    const books = collectionOrRepo.books;
    const desiredVersion = getDesiredVersionVer1(approved_versions, collectionOrRepo);

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
};

const transformDataVer2 = (data: ApprovedBooksAndVersionsVer2) => {
  // get all the v1 archive entries
  const v1Data: ApprovedBooksAndVersionsVer1 = {
    approved_books: data.approved_books.filter((b) => isApprovedCollectionVer1(b)) as ApprovedCollectionVer1[],
    approved_versions: data.approved_versions,
  };
  const results = transformDataVer1(v1Data);

  // Add the v2 git entries
  const approvedRepos = data.approved_books.filter((b) => isApprovedRepoVer2(b)) as ApprovedRepoVer2[];
  for (const repo of approvedRepos) {
    if (!repo.platforms.includes(ApprovedPlatformKindVer2.REX)) {
      continue;
    }
    const versions = repo.versions.sort(
      (a, b) => Date.parse(a.commit_metadata.committed_at) - Date.parse(b.commit_metadata.committed_at)
    );

    for (const version of versions) {
      if (archiveVersion && version.min_code_version > archiveVersion) { continue; }

      for (const book of version.commit_metadata.books) {
        let sha = version.commit_sha;
        if (version.commit_sha.length > 7) {
          sha = version.commit_sha.substr(0, 7);
        }
        if (configuredBooks[book.uuid] && configuredBooks[book.uuid].defaultVersion === sha) {
          // we are not interested in the currentVersion or any book versions older than that
          delete results[book.uuid];
        } else {
          results[book.uuid] = sha;
        }
      }
    }
  }

  return results;
};

const transformData = () => {
  const { data } = argv as { data?: string };

  if (!data) {
    throw new Error('data argument is missing');
  }

  let parsed: ApprovedBooksAndVersionsVer1;
  let results;
  try {
    parsed = JSON.parse(data);
    if (isApprovedBooksAndVersionsVer2(parsed)) {
      results = transformDataVer2(parsed);
    } else if (isApprovedBooksAndVersionsVer1(parsed)) {
      results = transformDataVer1(parsed);
    } else {
      throw new Error('Data is valid JSON, but has wrong structure. See ApprovedBooksAndVersions interface.');
    }
  } catch (e) {
    throw new Error(`Error while parsing data. Details: ${e}`);
  }

  // this script is used in the update-content/script.bash
  // so we write results to the terminal to assign them to a variable
  process.stdout.write(JSON.stringify(results));
  return results;
};

transformData();
