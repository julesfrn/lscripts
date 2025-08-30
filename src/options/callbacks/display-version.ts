import { exit } from 'node:process'

const pkg = require('../../../package.json')

export const displayVersion = () => {
  console.log(`You are currently using lscripts version ${pkg.version}`)
  exit(0)
}
