![Seneca Typeform-Provider](http://senecajs.org/files/assets/seneca-logo.png)

> _Seneca Typeform-Provider_ is a plugin for [Seneca](http://senecajs.org)

Provides access to the Typeform API using the Seneca _provider_
convention. Typeform API entities are represented as Seneca entities so
that they can be accessed using the Seneca entity API and messages.

See [@seneca/entity](https://github.com/senecajs/seneca-entity) and the [Seneca Data
Entities
Tutorial](https://senecajs.org/docs/tutorials/understanding-data-entities.html) for more details on the Seneca entity API.

<!-- [![npm version](https://img.shields.io/npm/v/@seneca/tangocard-provider.svg)](https://npmjs.com/package/@seneca/tangocard-provider)
[![build](https://github.com/senecajs/seneca-tangocard-provider/actions/workflows/build.yml/badge.svg)](https://github.com/senecajs/seneca-tangocard-provider/actions/workflows/build.yml)
[![Coverage Status](https://coveralls.io/repos/github/senecajs/seneca-tangocard-provider/badge.svg?branch=main)](https://coveralls.io/github/senecajs/seneca-tangocard-provider?branch=main)
[![Known Vulnerabilities](https://snyk.io/test/github/senecajs/seneca-tangocard-provider/badge.svg)](https://snyk.io/test/github/senecajs/seneca-tangocard-provider)
[![DeepScan grade](https://deepscan.io/api/teams/5016/projects/19462/branches/505954/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=5016&pid=19462&bid=505954)
[![Maintainability](https://api.codeclimate.com/v1/badges/f76e83896b731bb5d609/maintainability)](https://codeclimate.com/github/senecajs/seneca-tangocard-provider/maintainability) -->

| ![Voxgig](https://www.voxgig.com/res/img/vgt01r.png) | This open source module is sponsored and supported by [Voxgig](https://www.voxgig.com). |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------- |

## Quick Example

```js
// Setup - get the key value (<SECRET>) separately from a vault or
// environment variable.
const seneca = Seneca()
  .use('@seneca/entity')
  // Get API keys using the @seneca/env plugin
  .use('@seneca/env', {
    var: {
      $TYPEFORM_ACCESSTOKEN: String,
    },
  })
  .use('@seneca/provider', {
    provider: {
      typeform: {
        keys: {
          accesstoken: { value: '$TYPEFORM_ACCESSTOKEN' },
        },
      },
    },
  })
  .use('@seneca/typeform-provider')

await seneca.ready()

const forms = await seneca.entity('provider/typeform/form').list$()

const form = await seneca
  .entity('provider/typeform/form')
  .load$('<typeform-form-id>')

console.log('FORM', form.title)
```

## Install

Requires Seneca 4 and Node.js 24 or later.

```sh
$ npm install seneca@^4 @seneca/entity @seneca/provider @seneca/env @seneca/typeform-provider
```

## How to get access

## Options

## Action Patterns

## Action Descriptions

## More Examples

## Motivation

## Support

## API

## Contributing

## Background
