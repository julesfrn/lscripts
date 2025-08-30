# lscripts

Command to list all the scripts in your `package.json`. Pick easely wich one you want to run and lscripts handles the rest !

![demo](https://github.com/julesfrn/lscripts/blob/main/demo.gif?raw=true)

## Install

Install the lscripts globally using your package manager you like.

``` bash
# using npm
npm install -g lscripts
# using yarn
yarn global add lscripts
# using pnpm
pnpm add -g lscripts
```

## Use

Simply run:
``` bash
lscripts
```

You can then pick the script you want to run using `Up` or `Down` keyes or by searching for the name of the script or the command its supposed to run and pressing `Enter`.

The script you chose will then be ran using your package manager. It determines the package manager you are using by checking what kind of lock file is present in your project. For now lscripts is compatible with `npm`, `yarn` and `pnpm`.

## Opitonal flags

- `--copy, -c`: This flag allows you to copy the script you pick to your clipboard instead of letting lscripts running it directly for you.
- `--version -v`: Displays the version of the package you are using.
- `--help -h`: Displays a help message.
