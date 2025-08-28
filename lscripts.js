#!/usr/bin/env node

import inquirer from 'inquirer'
import inquirerPrompt from 'inquirer-autocomplete-prompt'
import fs from 'fs'
import { exit } from 'process'
import { spawn } from 'child_process'

const getPackageManagerEngine = () => {
  if (fs.existsSync('./package-lock.json')) return 'npm'
  if (fs.existsSync('./yarn.lock')) return 'yarn'
  if (fs.existsSync('./pnpm-lock.yaml')) return 'pnpm'
  return null
} 

const runner = getPackageManagerEngine()

if (!runner) {
  console.log('Please install your dependencies before using lscripts.')
  console.log('lscripts uses the lock file to determine which package manager you are using.')
  console.log('lscripts is currently only compatible with npm, yarn and pnpm.')
  exit(1)
}

const scripts = Object.entries(JSON.parse(fs.readFileSync('./package.json')).scripts)

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
