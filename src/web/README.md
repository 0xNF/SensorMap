The Smap2 branch, (nėe map_display), is the current master branch for the 2.0 version of the SensorMap. 

## Installation
TODO

## Building
### Windows
Currently, Windows development builds are not supported due to an undiagnosed error in the `rollup.config.js` file when running `npm run dev`. We recommend running from WSL. For development purposes, using vs code from wsl is also recommended.

### Linux
#### Dependency Acquisition
```bash
npm install
```

#### Dev Server
```
npm run dev
```

#### VS Code
First, run the dev server in a terminal:
```bash
npm run dev
```

Then from VS Code:  
Debug -> Launch from Chrome (or firefox).    

This requires either the Firefox or Chrome debugger extensions.

