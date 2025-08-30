import { existsSync, readFileSync, realpathSync } from 'node:fs'
import { exit } from 'node:process'

const rootDir = '/'

type PackageJson = {
  scripts: Record<string, string>
}

const findPackageJsonInWorkingDirOrParent = (currentDir = './'): PackageJson | null => {
  if (existsSync(`${currentDir}package.json`))
    return JSON.parse(readFileSync(`${currentDir}package.json`) as unknown as string)
  if (realpathSync(currentDir) === rootDir) return null
  return findPackageJsonInWorkingDirOrParent(`${currentDir}../`)
}

export const getScriptsFromPackageJson = () => {
  const packageJson = findPackageJsonInWorkingDirOrParent()

  if (!packageJson) {
    console.log('No package.json was found in current directory or parent directories.')
    console.log('Make sure you are in a NodeJS project before running lscripts.')
    exit(1)
  }
  
  return Object.entries(packageJson.scripts)
}
