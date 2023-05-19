#!/usr/bin/env node
const path = require('path');
const getPort = require('get-port-please');
const rdfServe = require('..');

async function main() {
  const port = process.argv.includes('-p') ? process.argv[process.argv.indexOf('-p') + 1] : await getPort.getPort();
  const basePath = path.join(process.cwd(), process.argv[2]);

  const app = await rdfServe.default(basePath, process.argv.includes('-l'));
  await app.listen(port);

  // eslint-disable-next-line no-console
  console.log(
    `RDF Serve available at http://localhost:${port}/ ${
      process.argv.includes('-l') ? 'with' : 'without'
    } containment triples`,
  );
}

main();
