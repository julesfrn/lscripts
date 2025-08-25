# lscripts

Command to list all the scripts in your `package.json`. Pick easely wich one you want to run, it will be copied to your clipboard!

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
The package will then copy the script to your clipboard so you can paste it in your terminal. It determines the package manager you are using checking if you have a `package-lock` or a `yarn-lock` file in your project to copy the proper command to your clipboard.
