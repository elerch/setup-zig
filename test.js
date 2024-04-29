const assert = require('assert').strict
const {
  resolveCommit,
  resolveVersion
} = require('./versions')

async function test () {
  assert.deepEqual(resolveCommit('x64', 'linux', '0.6.0+4b48fccad'), {
    downloadUrl: 'https://ziglang.org/builds/zig-linux-x86_64-0.6.0+4b48fccad.tar.xz',
    fileWithoutFileType: 'zig-linux-x86_64-0.6.0+4b48fccad',
    variantName: 'zig-linux-x86_64-0.6.0',
    version: '0.6.0'
  })
  assert.deepEqual(resolveCommit('x64', 'win32', '0.6.0+4b48fccad'), {
    downloadUrl: 'https://ziglang.org/builds/zig-windows-x86_64-0.6.0+4b48fccad.zip',
    fileWithoutFileType: 'zig-windows-x86_64-0.6.0+4b48fccad',
    variantName: 'zig-windows-x86_64-0.6.0',
    version: '0.6.0'
  })
  assert.deepEqual(resolveCommit('x64', 'win32', '0.12.0-dev.1092+68ed78775'), {
    downloadUrl: 'https://ziglang.org/builds/zig-windows-x86_64-0.12.0-dev.1092+68ed78775.zip',
    fileWithoutFileType: 'zig-windows-x86_64-0.12.0-dev.1092+68ed78775',
    variantName: 'zig-windows-x86_64-0.12.0-dev.1092',
    version: '0.12.0-dev.1092'
  })
  assert.deepEqual(resolveCommit('x64', 'darwin', '0.12.0-dev.1150+3c22cecee'), {
    downloadUrl: 'https://ziglang.org/builds/zig-macos-x86_64-0.12.0-dev.1150+3c22cecee.tar.xz',
    fileWithoutFileType: 'zig-macos-x86_64-0.12.0-dev.1150+3c22cecee',
    variantName: 'zig-macos-x86_64-0.12.0-dev.1150',
    version: '0.12.0-dev.1150'
  })

  assert.deepEqual(await resolveVersion('x64', 'linux', '0.7.0'), {
    downloadUrl: 'https://ziglang.org/download/0.7.0/zig-linux-x86_64-0.7.0.tar.xz',
    variantName: 'zig-linux-x86_64-0.7.0',
    version: '0.7.0'
  })
  assert.deepEqual(await resolveVersion('x64', 'win32', '0.4.0'), {
    downloadUrl: 'https://ziglang.org/download/0.4.0/zig-windows-x86_64-0.4.0.zip',
    variantName: 'zig-windows-x86_64-0.4.0',
    version: '0.4.0'
  })
  assert.deepEqual(await resolveVersion('arm64', 'darwin', '0.11.0'), {
    downloadUrl: 'https://ziglang.org/download/0.11.0/zig-macos-aarch64-0.11.0.tar.xz',
    variantName: 'zig-macos-aarch64-0.11.0',
    version: '0.11.0'
  })
  assert.deepEqual(await resolveVersion('arm64', 'darwin', '2024.1.0-mach'), {
    downloadUrl: 'https://pkg.machengine.org/zig/zig-macos-aarch64-0.12.0-dev.2063+804cee3b9.tar.xz',
    variantName: 'zig-macos-aarch64-0.12.0-dev.2063',
    version: '2024.1.0-mach'
  })
  assert.deepEqual(await resolveVersion('x64', 'linux', '2024.3.0-mach'), {
    downloadUrl: 'https://pkg.machengine.org/zig/zig-linux-x86_64-0.12.0-dev.3180+83e578a18.tar.xz',
    variantName: 'zig-linux-x86_64-0.12.0-dev.3180',
    version: '2024.3.0-mach'
  })
  assert.deepEqual(await resolveVersion('x64', 'win32', '2024.1.0-mach'), {
    downloadUrl: 'https://pkg.machengine.org/zig/zig-windows-x86_64-0.12.0-dev.2063+804cee3b9.zip',
    variantName: 'zig-windows-x86_64-0.12.0-dev.2063',
    version: '2024.1.0-mach'
  })
  assert.deepEqual(await resolveVersion('arm64', 'darwin', '2024.3.0-mach'), {
    downloadUrl: 'https://pkg.machengine.org/zig/zig-macos-aarch64-0.12.0-dev.3180+83e578a18.tar.xz',
    variantName: 'zig-macos-aarch64-0.12.0-dev.3180',
    version: '2024.3.0-mach'
  })
  await assert.doesNotReject(resolveVersion('x64', 'linux', 'mach-latest'))
  await assert.doesNotReject(resolveVersion('x64', 'win32', 'mach-latest'))
  await assert.doesNotReject(resolveVersion('arm64', 'darwin', 'mach-latest'))
  await assert.doesNotReject(resolveVersion('x64', 'linux', 'master'))
  await assert.doesNotReject(resolveVersion('x64', 'win32', 'master'))
  await assert.doesNotReject(resolveVersion('arm64', 'darwin', 'master'))
}

test().catch((error) => {
  console.error(error.stack)
  process.exit(1)
})
