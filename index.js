/**
 * pkg-availability - A package availability checker for npm packages.
 * Copyright (c) 2018 bukharim96 <bukharim96@gmail.com>
 */

const https = require('https')
const fs = require('fs')
const chalk = require('chalk')
const spinner = require('loading-indicator')

const packages = process.argv.splice(0, 2) && process.argv

// check package availability
function clearConsole() {
  // This seems to work best on Windows and other systems.
  // The intention is to clear the output so you can focus on most recent build.
  process.stdout.write('\x1bc');
}

/**
 * updatePackageListCache
 * 
 * @description Downloads entire npm packages list and saves it into a JSON blob.
 * @returns {undefined}
 */
function updatePackageListCache() {
  https.get('https://replicate.npmjs.com/_all_docs', (res) => {
    const { statusCode } = res;
    const contentType = res.headers['content-type'];

    let error;
    if (statusCode !== 200) {
      error = new Error('Request Failed.\n' +
                        `Status Code: ${statusCode}`);
    } else if (!/^application\/json/.test(contentType)) {
      error = new Error('Invalid content-type.\n' +
                        `Expected application/json but received ${contentType}`);
    }
    if (error) {
      console.error(error.message);
      // consume response data to free up memory
      res.resume();
      return;
    }

    res.setEncoding('utf8');

    const spinnerHandle = spinner.start(
      chalk.cyan(
        'Initializing daily package caching process... (this will take a while)'
      )
    )

    let rawData = ''
    res.on('data', chunk => rawData += chunk)
    
    res.on('end', () => {
      let jsonChunk = JSON.parse(rawData).rows
      let data = []

      // Format
      for (let i = 0; i < jsonChunk.length; i++) {
        data.push(jsonChunk[i].id)
      }

      // Cache data
      fs.writeFileSync('./cache/pkg-list-cache.json', JSON.stringify(data), 'utf8');
      fs.writeFileSync('./cache/last-update.txt', Date.now(), 'utf8')

      spinner.stop(spinnerHandle)
      console.log(chalk.green('Package cache update successfully...'))

      logAvailabilityCheckInfo()
    });
  }).on('error', (e) => {
    spinner.stop(spinnerHandle)
    console.error('ERROR: ' + e.message);
  });
}

function isPackageAvailable(needle, haystack) {
  return !haystack.includes(needle)
}

function logAvailabilityCheckInfo() {
  clearConsole()
  process.stdin.setEncoding('utf8');
  process.stdin.on('readable', () => {
    const cachedPackageList = fs.readFileSync('./cache/pkg-list-cache.json', 'utf8')

    process.stdout.write(
      chalk.hex('#ffa500').bold(`\n\n  PKG-AVAILABILTY`) + chalk.grey(` - NPM PACKAGE AVAILABILITY CHECKER\n\n\n`)
    )

    for(let i = 0; i < packages.length; i++) {
      const packageName = packages[i]
      const chalkedPackageName = chalk.cyan(packageName)
      const dots = chalk.grey('.').repeat(30 - packageName.length)
      const availability = isPackageAvailable(packageName, cachedPackageList)
                         ? chalk.green('AVAILABLE')
                         : chalk.red('NOT AVAILABLE')
      
      process.stdout.write(`      ${chalkedPackageName} ${dots} ${availability}\n\n`)
    }

    console.log("\n\n")
  });
}

function init() {
  
  if (!packages.length) {
    console.log(chalk.red('ERROR: No package name(s) provided.'))
    return
  }

  if (
      !fs.existsSync('./cache/pkg-list-cache.json')
      ||
      Date.now() - Number(fs.readFileSync('./cache/last-update.txt', 'utf8')) > 864e5
    )
      updatePackageListCache()
    else
      logAvailabilityCheckInfo()
}

init()
