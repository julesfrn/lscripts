import { displayHelpMessage, displayVersion, useCopyMode } from './callbacks'
import { argv, exit } from 'node:process'

type AvailableOption = {
  flags: string[],
  callback: () => void
}

const availableOptions: AvailableOption[] = [
  { flags: ['--help', '-h'], callback: displayHelpMessage },
  { flags: ['--version', '-v'], callback: displayVersion },
  { flags: ['--copy', '-c'], callback: useCopyMode }
]

export const parseOptions = () => {
  if (argv.length < 3) return
  if (argv.length > 3) {
    console.log('You can only pass one argument at a time to lscripts.')
    console.log(`Run 'lscripts --help' for more information.`)
    return exit(1)
  }

  const arg = argv[2]
  const flag = availableOptions.find(({ flags }) => flags.includes(arg))

  if (!flag) {
    console.log(`Unkown argument "${arg}".`)
    console.log(`Run 'lscripts --help' for more information.`)
    return exit(1)
  }

  flag.callback()
}
