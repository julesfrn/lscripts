#!/usr/bin/env node

import search from '@inquirer/search'
import clipboard from 'clipboardy'

import { spawn } from 'node:child_process'

import { parseOptions } from './options'
import { getScriptsFromPackageJson } from './get-scripts-from-package-json'
import { getPackageManagerEngine } from './get-package-manager-engine'
import { sharedState } from './shared-state'

parseOptions()
const scripts = getScriptsFromPackageJson()
const runner = getPackageManagerEngine()

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
  message: sharedState.useCopyMode
    ? 'What script do you want to copy to your clipboard ?'
    : 'What script do you want to run ?',
  pageSize: scripts.length,
  source
}).then((script) => {
  const command = `${runner} run ${script.match(regex)![1]}`

  if (sharedState.useCopyMode) {
    clipboard.writeSync(command)
    console.log('✅ Command copied to your clipboard!')
    console.log('You can paste it and run it!')
    return
  }

  console.log(`🚀 ${command}`)
  spawn(command, { stdio: 'inherit', shell: true })
    .on('exit', process.exit)
})
