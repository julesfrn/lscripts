#!/usr/bin/env node

import inquirer from 'inquirer'
import inquirerPrompt from 'inquirer-autocomplete-prompt'
import { exec } from 'child_process'

const scripts = {
  "test": "mocha .",
  "start:dev": "nodemon main.js",
  "build": "tsc --config ts/tsconfig.json"
}

const source = async (_, input) => {
  const pairs = Object.entries(scripts)
  return pairs.reduce((acc, [name, command]) => {
    const script = `"${name}": "${command}"`
    if (script.includes(input) || input === undefined) acc.push(script)
    return acc
  }, [])
}

inquirer.registerPrompt('autocomplete', inquirerPrompt)
inquirer.prompt({
  type: 'autocomplete',
  name: 'script',
  message: 'Whate script do you want to run ?',
  emptyText: `Sorry, I couldn't find the script you are looking for...`,
  searchText: 'Looking for the script...',
  source
}).then(({ script }) => {
  exec('npm run test', (err, out) => {
    console.log(out)
  })
})