# pkg-availability

**pkg-availability** is a CLI tool for checking npm package name availability. I wrote it as a weekend project to help easen the daunting process of searching for package names one by one on npm. With this tool, I just paste in a list of names and it does the checking. It then outputs a pretty list with details on the availability of each package name.

<p align="center">
  <img src="https://raw.githubusercontent.com/bukharim96/pkg-availability/master/preview.png">
  <br>
  <small>A package availability checker for npm packages</small>
</p>

## Installation

To start using this tool, install it with npm follows:
```
npm i -g pkg-availibity
```

You could also install via yarn:
```
yarn global add pkg-availibity
```

## Usage

Just feed it a list of names:

npm
```
npm run pkg-availibity lodash react foo-pkg
```

yarn
```
yarn pkg-availibity bar=tools react my-next-pkg
```

*Enjoy!*