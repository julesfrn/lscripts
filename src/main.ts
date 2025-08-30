#!/usr/bin/env node

import search from '@inquirer/search'
import clipboard from 'clipboardy'

import { existsSync, readFileSync, realpathSync } from 'node:fs'
import { exit, argv } from 'node:process'
import { spawn } from 'node:child_process'

const pkg = require('../package.json')

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
  console.log(`You are currently using lscripts version ${pkg.version}`)
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
  if (existsSync(`${currentDir}package.json`))
    return JSON.parse(readFileSync(`${currentDir}package.json`) as unknown as string)
  if (realpathSync(currentDir) === rootDir) return null
  return findPackageJsonInWorkingDirOrParent(`${currentDir}../`)
}

const getScriptsFromPackageJson = (packageJson: { scripts: Record<string, string> }) =>
  Object.entries(packageJson.scripts)

const getPackageManagerEngine = (currentDir = './') => {
  if (existsSync(`${currentDir}package-lock.json`)) return 'npm'
  if (existsSync(`${currentDir}yarn.lock`)) return 'yarn'
  if (existsSync(`${currentDir}pnpm-lock.yaml`)) return 'pnpm'
  if (realpathSync(currentDir) === rootDir) return null
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
  console.log('Please install your dependencies at least once before using lscripts.')
  console.log('lscripts uses the lock file to determine which package manager you are using.')
  console.log('lscripts is currently only compatible with npm, yarn and pnpm.')
  exit(1)
}

const regex = /^(.+) -  /

process.on('uncaughtException', (error) => {
  if (error instanceof Error && error.name === 'ExitPromptError')
    console.log('👋 until next time!')
  else throw error
})

const source = async (input: string | void) => {
  return scripts.reduce<string[]>((acc, [name, command]) => {
    const script = `${name} -  "${command}"`
    if (input === undefined || script.includes(input)) acc.push(script)
    return acc
  }, [])
}

search<string>({
  message: isCopyModeEnabled
    ? 'What script do you want to copy to your clipboard ?'
    : 'What script do you want to run ?',
  pageSize: scripts.length,
  source
}).then((script) => {
  const command = `${runner} run ${script.match(regex)![1]}`

  if (isCopyModeEnabled) {
    clipboard.writeSync(command)
    console.log('✅ Command copied to your clipboard!')
    console.log('You can paste it and run it!')
    return
  }

  console.log(`🚀 ${command}`)
  spawn(command, { stdio: 'inherit', shell: true })
    .on('exit', process.exit)
})
