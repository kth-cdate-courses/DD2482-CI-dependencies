// Recursivly list all files in the directory apps/

import { $ } from 'bun';

/**
 * Locate all package.json files in the apps/ directory
 */
const packageJsonFilesWithDeps = await $`find apps/* -name package.json`.text();
const packageJsonFiles = packageJsonFilesWithDeps
  .split('\n')
  .filter((path) => !path.includes('node_modules') && path.length > 0);

const dependencyDictionary: Record<string, string[]> = {};
const devDependencyDictionary: Record<string, string[]> = {};

/**
 * Extract dependencies from package.json files
 */
for (const file of packageJsonFiles) {
  dependencyDictionary[file] = [];
  devDependencyDictionary[file] = [];

  const packageJson = await $`cat ./${file}`.json();
  const dependencies = packageJson.dependencies || {};
  const devDependencies = packageJson.devDependencies || {};

  for (const [name, version] of Object.entries(dependencies)) {
    dependencyDictionary[file].push(`${name}@${version}`);
  }

  for (const [name, version] of Object.entries(devDependencies)) {
    devDependencyDictionary[file].push(`${name}@${version}`);
  }
}
const versionDicitonary = compileVersionDictionary({
  ...dependencyDictionary,
  ...devDependencyDictionary,
});
const faultReport = getFaultReport(versionDicitonary);
if (Object.keys(faultReport).length > 0) {
  console.error('Dependency version mismatch found in the following projects:');
  console.error(faultReport);
  process.exit(1);
}
console.log('All dependencies are synced across all projects');

/**
 * UTILITY FUNCTIONS BELOW
 */

type VersionDictionary = Record<string, Record<string, string[]>>;
function compileVersionDictionary(deps: Record<string, string[]>) {
  /*
        Example data structure:
        {
            <library>: {
                <version>: [<project>, <project>, ...],
            }
        }
     */

  const versionDictionary: VersionDictionary = {};
  for (const [file, dependencies] of Object.entries(deps)) {
    for (const dependecy of dependencies) {
      const [dependencyName, dependencyVersion] = splitVersion(dependecy);
      if (versionDictionary[dependencyName] === undefined) {
        versionDictionary[dependencyName] = {};
      }

      if (versionDictionary[dependencyName][dependencyVersion] === undefined) {
        versionDictionary[dependencyName][dependencyVersion] = [];
      }

      versionDictionary[dependencyName][dependencyVersion].push(file);
    }
  }

  // We're interested in deps with multiple versions
  return Object.fromEntries(
    Object.entries(versionDictionary)
      .filter(([_, versions]) => Object.keys(versions).length > 1)
  );

}

type FaultReport = Record<string, Record<string, string>>;
function getFaultReport(versionDictionary: VersionDictionary) {
  /* example format of fault report
    {
        <project>: {
            <library>: "Has version <version> but should have <version>"
        }
    }
    */
  const faultReport: FaultReport = {};

  for (const [library, versions] of Object.entries(versionDictionary)) {
    const versionKeys = Object.keys(versions);
    const sortedVersions = versionKeys.toSorted(compareSemVer);
    for (const version of sortedVersions.slice(1)) {
      for (const project of versions[version]) {
        if (faultReport[project] === undefined) {
          faultReport[project] = {};
        }

        faultReport[project][
          library
        ] = `Has version ${version} but should be ${sortedVersions[0]}`;
      }
    }
  }
  return faultReport;
}

function splitVersion(dependency: string) {
  const splits = dependency.split('@');
  if (splits.length === 2) return splits;
  return [splits.slice(0, -1).join('@'), splits.slice(-1)[0]];
}

function compareSemVer(a: string, b: string) {
  const semverRegex = /\d+\.\d+\.\d+/i;
  const aSplits = a
    .match(semverRegex)?.[0]
    .split('.')
    .map((n) => parseInt(n));
  const bSplits = b
    .match(semverRegex)?.[0]
    .split('.')
    .map((n) => parseInt(n));
  if (!aSplits || !bSplits) return NaN;

  for (let i = 0; i < aSplits.length; i++) {
    if (aSplits[i] > bSplits[i]) return -1;
    if (aSplits[i] < bSplits[i]) return 1;
  }

  return 0;
}
