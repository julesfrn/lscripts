#!/usr/bin/env node

import inquirer from 'inquirer'
import inquirerPrompt from 'inquirer-autocomplete-prompt'
import fs from 'fs'
import { exit, argv } from 'process'
import { spawn } from 'child_process'
import clipboard from 'clipboardy'
import lscriptsPackageJson from './package.json' with { type: "json" }

const rootDir = '/'

let isCopyModeEnabled = false
const useCopyMode = () => {
  isCopyModeEnabled = true
}

const displayHelpMessage = () => {
  console.log(`Usage: lscripts [option]
Simply list and run a script form the package.json of your current node project.

 option      alias   description
----------- ------- -----------------------------------------------------------------
 --copy      -c      Enables copy mode: when you pick your script, it will be copied
                     to your clipboard instead of being ran immediately
 --version   -v      Displays your installed version of lscripts
 --help      -h      Displays this help message

You can only pass one argument at a time to lscripts command.`)
  exit(0)
}

const displayVersion = () => {
  console.log(`You are currently using lscripts version ${lscriptsPackageJson.version}`)
  exit(0)
}

const possibleFlags = [
  { flags: ['--copy', '-c'], callback: useCopyMode },
  { flags: ['--help', '-h'], callback: displayHelpMessage },
  { flags: ['--version', '-v'], callback: displayVersion }
]

const parseArguments = () => {
  if (argv.length < 3) return
  if (argv.length > 3) {
    console.log('You can only pass one argument at a time to lscripts.')
    console.log(`Run 'lscripts --help' for more information.`)
    return exit(1)
  }

  const arg = argv[2]
  const flag = possibleFlags.find(({ flags }) => flags.includes(arg))

  if (!flag) {
    console.log(`Unkown argument "${arg}".`)
    console.log(`Run 'lscripts --help' for more information.`)
    return exit(1)
  }

  flag.callback()
}

const findPackageJsonInWorkingDirOrParent = (currentDir = './') => {
  if (fs.existsSync(`${currentDir}package.json`)) return JSON.parse(fs.readFileSync(`${currentDir}package.json`))
  if (fs.realpathSync(currentDir) === rootDir) return null
  return findPackageJsonInWorkingDirOrParent(`${currentDir}../`)
}

const getScriptsFromPackageJson = (packageJson) => Object.entries(packageJson.scripts)

const getPackageManagerEngine = (currentDir = './') => {
  if (fs.existsSync(`${currentDir}package-lock.json`)) return 'npm'
  if (fs.existsSync(`${currentDir}yarn.lock`)) return 'yarn'
  if (fs.existsSync(`${currentDir}pnpm-lock.yaml`)) return 'pnpm'
  if (fs.realpathSync(currentDir) === rootDir) return null
  return getPackageManagerEngine((`${currentDir}../`))
}

parseArguments()

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
  message: isCopyModeEnabled
    ? 'What script do you want to copy to your clipboard ?'
    : 'What script do you want to run ?',
  emptyText: `Sorry, I couldn't find the script you are looking for...`,
  searchText: 'Looking for the script...',
  pageSize: scripts.length,
  source
}).then(({ script }) => {
  const command = `🚀 ${runner} run ${script.match(regex)[1]}`

  if (isCopyModeEnabled) {
    clipboard.writeSync(command)
    console.log('✅ Command copied to your clipboard!')
    console.log('You can paste it and run it!')
    return
  }

  console.log(command)
  spawn(command, { stdio: 'inherit', shell: true })
    .on('exit', process.exit)
})
