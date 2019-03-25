rstk-sfdx-utils
===============

Collection of commands to work with SalesforceDX codebases

[![Version](https://img.shields.io/npm/v/rstk-sfdx-utils.svg)](https://npmjs.org/package/rstk-sfdx-utils)
[![CircleCI](https://circleci.com/gh/RootstockMFG/rstk-sfdx-utils/tree/master.svg?style=shield)](https://circleci.com/gh/RootstockMFG/rstk-sfdx-utils/tree/master)
[![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/RootstockMFG/rstk-sfdx-utils?branch=master&svg=true)](https://ci.appveyor.com/project/heroku/rstk-sfdx-utils/branch/master)
[![Codecov](https://codecov.io/gh/RootstockMFG/rstk-sfdx-utils/branch/master/graph/badge.svg)](https://codecov.io/gh/RootstockMFG/rstk-sfdx-utils)
[![Greenkeeper](https://badges.greenkeeper.io/RootstockMFG/rstk-sfdx-utils.svg)](https://greenkeeper.io/)
[![Known Vulnerabilities](https://snyk.io/test/github/RootstockMFG/rstk-sfdx-utils/badge.svg)](https://snyk.io/test/github/RootstockMFG/rstk-sfdx-utils)
[![Downloads/week](https://img.shields.io/npm/dw/rstk-sfdx-utils.svg)](https://npmjs.org/package/rstk-sfdx-utils)
[![License](https://img.shields.io/npm/l/rstk-sfdx-utils.svg)](https://github.com/RootstockMFG/rstk-sfdx-utils/blob/master/package.json)

<!-- toc -->

<!-- tocstop -->
<!-- install -->
<!-- usage -->
```sh-session
$ npm install -g rstk-sfdx-utils
$ sfdx COMMAND
running command...
$ sfdx (-v|--version|version)
rstk-sfdx-utils/0.0.2 darwin-x64 node-v11.10.1
$ sfdx --help [COMMAND]
USAGE
  $ sfdx COMMAND
...
```
<!-- usagestop -->
<!-- commands -->
* [`sfdx <%= command.id %> -f <string> [-o] [-c] [-x] [-y] [--json] [--loglevel trace|debug|info|warn|error|fatal]`](#sfdx--commandid---f-string--o--c--x--y---json---loglevel-tracedebuginfowarnerrorfatal)

## `sfdx <%= command.id %> -f <string> [-o] [-c] [-x] [-y] [--json] [--loglevel trace|debug|info|warn|error|fatal]`

Review the unit test codecoverage report for an org and return an error if the coverage is not sufficient

```
USAGE
  $ sfdx rstk:apex:codecoverage:check -f <string> [-o] [-c] [-x] [-y] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal]

OPTIONS
  -c, --ignoreclasscoverage                       Include this flag will not fail the command if the individal Apex
                                                  classes code coverage is below the amount specified

  -f, --testcoveragefile=testcoveragefile         (required) Location of test coverage file.  Usually, this is the
                                                  'test-result-707000000000000.json' where the 707 number is the unit
                                                  test run id.  Be sure to choose the json file.

  -o, --ignoreorgcoverage                         Include this flag will not fail the command if the org coverage is
                                                  below the amount specified

  -x, --throwerroroninsufficientorgcoverage       If true, the command will throw an error exception if the org code
                                                  coverage requirement is not met.

  -y, --throwerroroninsufficientclasscoverage     If true, the command will throw an error exception if the class code
                                                  coverage requirement is not met.

  --json                                          format output as json

  --loglevel=(trace|debug|info|warn|error|fatal)  [default: warn] logging level for this command invocation

DESCRIPTION
  Set org and individual class coverage thresholds in the sfdx-project.json file.  Add some or all of the following 
  attributes to the "plugins.rstk.coverarageRequirement" section of the project json file.

  "plugins": {
       "rstk": {
           "coverarageRequirement": {
               "class": "75",
               "org": "45",
               "ignoreClassCoverage": false,
               "ignoreOrgCoverage": true,
               "throwErrorOnInsufficientOrgCoverage": false,
               "throwErrorOnInsufficientClassCoverage": false
           }
       }
  }

EXAMPLES
  $ sfdx rstk:apex:codecoverage:check --targetusername myOrg@example.com --targetdevhubusername devhub@org.com 
  --testcoveragefile test-result-707000000000000.json
  Reviewing code coverage from file test-result-707000000000000.json

  $ sfdx rstk:apex:codecoverage:check --testcoveragefile test-result-707000000000000.json --ignoreorgcoverage 
  --throwerroroninsufficientclasscoverage --json
  Reviewing code coverage from file test-result-707000000000000.json
```

_See code: [src/commands/rstk/apex/codecoverage/check.ts](https://github.com/RootstockMFG/rstk-sfdx-utils/blob/v0.0.2/src/commands/rstk/apex/codecoverage/check.ts)_
<!-- commandsstop -->
