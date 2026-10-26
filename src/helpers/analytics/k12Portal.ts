import type createOSWebLoader from '../../gateways/createOSWebLoader';

type SchoolDataLoader = Pick<ReturnType<typeof createOSWebLoader>, 'getSchoolDataFromPortalName'>;

const portalPathPattern = /\/portal\/([^/]+)/;

const results = new Map<string, Promise<boolean>>();
const confirmedK12 = new Set<string>();
const k12WithResearchAgreement = new Set<string>();

export const getPortalNameFromPath = (pathname: string) => pathname.match(portalPathPattern)?.[1];

export const isK12Portal = (loader: SchoolDataLoader, portalName: string): Promise<boolean> => {
  const existing = results.get(portalName);
  if (existing) { return existing; }

  const result = loader.getSchoolDataFromPortalName(portalName)
    .then((schoolData) => {
      const isK12 = schoolData?.industry === 'K12';
      if (isK12) { confirmedK12.add(portalName); }
      if (isK12 && schoolData.research_agreement_active) { k12WithResearchAgreement.add(portalName); }
      return isK12;
    })
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.error('Error fetching school data', e);
      return false;
    });

  results.set(portalName, result);
  return result;
};

// Only a confirmed K12 school turns tracking off; pending or failed lookups and portals without a school don't
export const portalIsK12 = (portalName: string) => confirmedK12.has(portalName);

export const portalHasResearchAgreement = (portalName: string) => k12WithResearchAgreement.has(portalName);

export const resetK12PortalCache = () => {
  results.clear();
  confirmedK12.clear();
  k12WithResearchAgreement.clear();
};
