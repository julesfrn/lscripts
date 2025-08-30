import { existsSync, realpathSync } from 'node:fs'
import { exit } from 'node:process'

const rootDir = '/'

const findPackageManagerEngine = (currentDir = './'): string | null => {
  if (existsSync(`${currentDir}package-lock.json`)) return 'npm'
  if (existsSync(`${currentDir}yarn.lock`)) return 'yarn'
  if (existsSync(`${currentDir}pnpm-lock.yaml`)) return 'pnpm'
  if (realpathSync(currentDir) === rootDir) return null
  return findPackageManagerEngine((`${currentDir}../`))
}

export const getPackageManagerEngine = (): string => {
  const packageManagerEngine = findPackageManagerEngine()

  if (!packageManagerEngine) {
    console.log('Please install your dependencies at least once before using lscripts.')
    console.log('lscripts uses the lock file to determine which package manager you are using.')
    console.log('lscripts is currently only compatible with npm, yarn and pnpm.')
    exit(1)
  }

  return packageManagerEngine
}
