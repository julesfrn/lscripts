#!/usr/bin/env node

import inquirer from 'inquirer'
import inquirerPrompt from 'inquirer-autocomplete-prompt'
import clipboard from 'clipboardy'
import fs from 'fs'

const scripts = Object.entries(JSON.parse(fs.readFileSync('./package.json')).scripts)
const runner = fs.existsSync('./package-lock.json') ? 'npm' : 'yarn'

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
  clipboard.writeSync(`${runner} run ${script.match(regex)[1]}`)
  console.log('✅ you can paste it and run it!')
})
