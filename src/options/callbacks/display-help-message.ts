import { exit } from 'node:process'

export const displayHelpMessage = () => {
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
