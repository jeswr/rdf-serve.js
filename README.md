# RDF Serve

A static file serve with content negotiation for RDF.

[![GitHub license](https://img.shields.io/github/license/jeswr/rdf-serve.js.svg)](https://github.com/jeswr/rdf-serve.js/blob/master/LICENSE)
[![npm version](https://img.shields.io/npm/v/rdf-serve.svg)](https://www.npmjs.com/package/rdf-serve)
[![build](https://img.shields.io/github/actions/workflow/status/jeswr/rdf-serve.js/nodejs.yml?branch=main)](https://github.com/jeswr/rdf-serve.js/tree/main/)
[![Dependabot](https://badgen.net/badge/Dependabot/enabled/green?icon=dependabot)](https://dependabot.com/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## Usage

The default export is a function called `rdfServe` which creates an express app serving documents at whichever
base path you input

```ts
import rdfServe from 'rdf-serve';

const app = rdfServe(path.join(__dirname, 'myFiles'));
app.listen(3005);
```

We also include the function `negotiateHandlerFactory` to allow the content negotiation to be included in your
own express app

```ts
import { negotiateHandlerFactory } from 'rdf-serve';
import express from 'express';

const app = express();
app.get("*", negotiateHandlerFactory(path.join(__dirname, 'myFiles')));
app.listen(3005);
```

## Cli Usage

To serve the contents of `./myFiles` run

```
rdf-serve ./myFiles
```

to specify the port these files should be served on run

```
rdf-serve ./myFiles -p 3005
```

to include `ldp:contains` triples on containers

```
rdf-serve ./myFiles -l
```
## License
©2023–present
[Jesse Wright](https://github.com/jeswr),
[MIT License](https://github.com/jeswr/useState/blob/master/LICENSE).
