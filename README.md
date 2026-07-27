![Seneca](http://senecajs.org/files/assets/seneca-logo.png)
> A [Seneca.js](http://senecajs.org) plugin

# @seneca/typeform-provider

[![build](https://github.com/senecajs/seneca-typeform-provider/actions/workflows/build.yml/badge.svg)](https://github.com/senecajs/seneca-typeform-provider/actions/workflows/build.yml)
[![Known Vulnerabilities](https://snyk.io/test/github/senecajs/seneca-typeform-provider/badge.svg)](https://snyk.io/test/github/senecajs/seneca-typeform-provider)

| ![Voxgig](https://www.voxgig.com/res/img/vgt01r.png) | This open source module is sponsored and supported by [Voxgig](https://www.voxgig.com). |
|---|---|

Provides access to the Typeform API using the Seneca *provider* convention. Typeform API entities are represented as Seneca entities so that they can be accessed using the Seneca entity API and messages.
See [seneca-entity](https://github.com/senecajs/seneca-entity) and the [Seneca Data Entities Tutorial](https://senecajs.org/docs/tutorials/understanding-data-entities.html) for more details on the Seneca entity API.

## Install

```sh
$ npm install @seneca/webflow-provider @seneca/env
```

## Quick Example

```js
Seneca()
  .use('typeform-provider')
```

## More Examples

See [test/](test/) for more usage examples.

## Motivation

A [Seneca.js](http://senecajs.org) plugin.

## Support

If you're using this module and need help, you can:

- Post a [github issue](https://github.com/senecajs/seneca-typeform-provider/issues)
- Tweet to [@senecajs](http://twitter.com/senecajs)
- Ask on the [Gitter](https://gitter.im/senecajs/seneca)

## API

See [source](https://github.com/senecajs/seneca-typeform-provider) for API details.

## Contributing

The [Senecajs org](https://github.com/senecajs/) encourages open participation. If you feel you can help in any way, be it with documentation, examples, extra testing, or new features please get in touch.

### Running tests

```sh
npm run test
```

## Background

Part of the [Senecajs org](https://github.com/senecajs/).
