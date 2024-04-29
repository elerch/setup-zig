const path = require('path')
const get = require('simple-get').concat
const semver = require('semver')

function extForPlatform (platform) {
  return {
    linux: 'tar.xz',
    darwin: 'tar.xz',
    win32: 'zip'
  }[platform]
}

/**
  * resolveCommit resolves a specific commit, so is only used
  * in cases where the zig version is specified through the use of a plus
  * sign. It does not require any fetch from an external resource as the
  * data (downloadUrl, etc) can be resolved directly
  */
function resolveCommit (arch, platform, version) {
  const ext = extForPlatform(platform)
  const resolvedOs = {
    linux: 'linux',
    darwin: 'macos',
    win32: 'windows'
  }[platform]

  const resolvedArch = {
    arm: 'armv7a',
    arm64: 'aarch64',
    ppc64: 'powerpc64',
    riscv64: 'riscv64',
    x64: 'x86_64'
  }[arch]

  const downloadUrl = `https://ziglang.org/builds/zig-${resolvedOs}-${resolvedArch}-${version}.${ext}`
  // This function is only called if the version includes a '+' sign, so mach versions
  // will not come through here
  //
  // Mach builds come from pkg.machengine.org
  // const machDownloadUrl = `https://pkg.machengine.org/zig/zig-${resolvedOs}-${resolvedArch}-${version}.${ext}`
  const versionWithoutBuildHash = semver.clean(version)
  const fileWithoutFileType = `zig-${resolvedOs}-${resolvedArch}-${version}`
  const variantName = `zig-${resolvedOs}-${resolvedArch}-${versionWithoutBuildHash}`

  return {
    downloadUrl,
    fileWithoutFileType,
    variantName,
    version: versionWithoutBuildHash
  }
}

function getJSON (opts) {
  return new Promise((resolve, reject) => {
    get({ ...opts, json: true }, (err, req, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

/**
  * resolveVersion resolves a generic commit, so is only used
  * in cases where the zig version is specified through WITHOUT the use of a plus
  * sign. It needs to fetch data from the index files provided by zig (or mach)
  * to determine the appropriate downloadUrl, etc.
  *
  * @returns {string} download URL for the version
  * @returns {string} file without file type (to match the function above)
  * @returns {string} variant name for the version - used as L2 (runner) cache key
  * @returns {string} version name - used as the L1 (job) cache key
  */
async function resolveVersion (arch, platform, version) {
  const ext = extForPlatform(platform)
  const resolvedOs = {
    linux: 'linux',
    darwin: 'macos',
    win32: 'windows'
  }[platform]

  const resolvedArch = {
    arm: 'armv7a',
    arm64: 'aarch64',
    ppc64: 'powerpc64',
    riscv64: 'riscv64',
    x64: 'x86_64'
  }[arch]

  const host = `${resolvedArch}-${resolvedOs}`

  // Mach json is advertised as a superset, but it's not updated on the same
  // timeframe as the ZSF index.json. So notably, 'master' will be an old version
  // on machengine.org
  const index = version.includes('mach')
    ? await getJSON({ url: 'https://machengine.org/zig/index.json' })
    : await getJSON({ url: 'https://ziglang.org/download/index.json' })

  const availableVersions = Object.keys(index)
  const useVersion = semver.valid(version)
    ? semver.maxSatisfying(availableVersions.filter((v) => semver.valid(v)), version)
    : null

  // The mach index is advertised as a strict superset of the ziglang index,
  // but we will fall back to the the ziglang index just in case
  const meta = index[useVersion || version] ||
    (await getJSON({ url: 'https://ziglang.org/download/index.json' }))[useVersion || version]

  if (!meta || !meta[host]) {
    throw new Error(`Could not find version ${useVersion || version} for platform ${host}`)
  }

  const downloadUrl = meta[host].tarball

  const fileWithoutFileType = downloadUrl.match(/.*\/(.*)(\.zip|\.tar\..*$)/)[1]
  // If this is mach, we could end up with '+sha...' at the end of this, as
  // a version of '2024.1.0-mach' will resolve to a specific dev version
  // So, while the function is not called with "+...", we still have to deal with
  // it. This is important as it is used as the cache key
  const variantName = path.basename(meta[host].tarball).replace(`.${ext}`, '').replace(/\+\S*$/, '')

  const versionFromDownloadUrl = variantName.match(/[^-]*-[^-]*-[^-]*-(.*)/)[1]

  return { downloadUrl, fileWithoutFileType, variantName, version: versionFromDownloadUrl }
}

module.exports = {
  extForPlatform,
  resolveCommit,
  resolveVersion
}
