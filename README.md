# lscripts

Command to list all the scripts in your `package.json`. Pick easely wich one you want to run and lscripts handles the rest !

![demo](https://github.com/julesfrn/lscripts/blob/main/demo.gif?raw=true)

## Install

With your favourite package manager you can install the package globaly using the git repo web URL.

``` bash
# using npm
npm install -g lscripts

# using yarn
yarn global add lscripts
```

## Use

Simply run:
``` bash
lscripts
```

You can then pick the script you want to copy to your clipboard using `Up` or `Down` keyes or by searching for the name of the script or the command its supposed to run and pressing `Enter`.
The script you chose will then be ran using your package manager. It determines the package manager you are using checking if you have a `package-lock` or a `yarn-lock` file in your project to copy the proper command to your clipboard.
