#!/usr/bin/env node

import inquirer from 'inquirer'
import inquirerPrompt from 'inquirer-autocomplete-prompt'
import fs from 'fs'
import { exit } from 'process'
import { spawn } from 'child_process'

const rootDir = '/'

const findPackageJsonInWorkingDirOrParent = (currentDir = './') => {
  if (fs.existsSync(`${currentDir}package.json`)) return fs.readFileSync(`${currentDir}package.json`)
  if (fs.realpathSync(currentDir) === rootDir) return null
  return findPackageJsonInWorkingDirOrParent(`${currentDir}../`)
}

const getScriptsFromPackageJson = (packageJson) =>
  Object.entries(JSON.parse(packageJson).scripts)

const getPackageManagerEngine = (currentDir = './') => {
  if (fs.existsSync(`${currentDir}package-lock.json`)) return 'npm'
  if (fs.existsSync(`${currentDir}yarn.lock`)) return 'yarn'
  if (fs.existsSync(`${currentDir}pnpm-lock.yaml`)) return 'pnpm'
  if (fs.realpathSync(currentDir) === rootDir) return null
  return getPackageManagerEngine((`${currentDir}../`))
}

const packageJson = findPackageJsonInWorkingDirOrParent()

if (!packageJson) {
  console.log('No package.json was found in current directory or parent directories.')
  console.log('Make sure you are in a NodeJS project before running lscripts.')
  exit(1)
}

const scripts = getScriptsFromPackageJson(packageJson)

const runner = getPackageManagerEngine()

if (!runner) {
  console.log('Please install your dependencies before using lscripts.')
  console.log('lscripts uses the lock file to determine which package manager you are using.')
  console.log('lscripts is currently only compatible with npm, yarn and pnpm.')
  exit(1)
}

const regex = /^(.+) -  /

const source = async (_, input) => {
  return scripts.reduce((acc, [name, command]) => {
    const script = `${name} -  "${command}"`
    if (script.includes(input) || input === undefined) acc.push(script)
    return acc
  }, [])
}

inquirer.registerPrompt('autocomplete', inquirerPrompt)
inquirer.prompt({
  type: 'autocomplete',
  name: 'script',
  message: 'What script do you want to copy to your clipboard ?',
  emptyText: `Sorry, I couldn't find the script you are looking for...`,
  searchText: 'Looking for the script...',
  pageSize: scripts.length,
  source
}).then(({ script }) => {
  const child = spawn(runner, ['run', script.match(regex)[1]], {
    stdio: 'inherit',
    shell: true
  })

  child.on('exit', (code) => {
    process.exit(code);
  })
})
