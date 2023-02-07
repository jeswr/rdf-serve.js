import path from 'path';
import type * as http from 'http';
import fs from 'fs';
import rdfParse from 'rdf-parse';
import arrayifyStream from 'arrayify-stream';
import rdfServe from '../lib';

const streamifyString = require('streamify-string');

function testOnPort(port: number) {
  it('Should return the original file when no content negotiation is applied', async () => {
    await expect(
      fetch(`http://localhost:${port}/jesse`).then((res) => res.text()),
    ).resolves.toEqual(
      fs.readFileSync(path.join(__dirname, 'sample', 'jesse.ttl'), 'utf8'),
    );

    await expect(
      fetch(`http://localhost:${port}/nested/person`).then((res) => res.text()),
    ).resolves.toEqual(
      fs.readFileSync(path.join(__dirname, 'sample', 'nested', 'person.shc'), 'utf8'),
    );
  });

  it('Should return the correct content negotiation when requested', async () => {
    const jsonldResponse = await fetch(`http://localhost:${port}/jesse`, {
      headers: new Headers({
        accept: 'application/ld+json',
      }),
    }).then((res) => res.text());

    expect(
      jsonldResponse,
    ).toContain('{');

    const quadStream = rdfParse.parse(streamifyString(jsonldResponse), { contentType: 'application/ld+json' });
    const quads = await arrayifyStream(quadStream);
    expect(quads).toHaveLength(1);
  });

  it('Should return 404 when the file does not exist', async () => {
    await expect(
      fetch(`http://localhost:${port}/does-not-exist`).then((res) => res.text()),
    ).resolves.toEqual('Not Found');

    await expect(
      fetch(`http://localhost:${port}/does-not-exist`).then((res) => res.status),
    ).resolves.toEqual(404);

    await expect(
      fetch(`http://localhost:${port}/`).then((res) => res.text()),
    ).resolves.toEqual('Not Found');

    await expect(
      fetch(`http://localhost:${port}/`).then((res) => res.status),
    ).resolves.toEqual(404);

    await expect(
      fetch(`http://localhost:${port}/folder/does/not/exist`).then((res) => res.text()),
    ).resolves.toEqual('Not Found');

    await expect(
      fetch(`http://localhost:${port}/folder/does/not/exist`).then((res) => res.status),
    ).resolves.toEqual(404);

    await expect(
      fetch(`http://localhost:${port}/folder/does/not/exist/`).then((res) => res.text()),
    ).resolves.toEqual('Not Found');

    await expect(
      fetch(`http://localhost:${port}/folder/does/not/exist/`).then((res) => res.status),
    ).resolves.toEqual(404);
  });

  it('Should return 406 on unacceptable content types', () => expect(
    fetch(`http://localhost:${port}/jesse`, {
      headers: new Headers({
        accept: 'text/html',
      }),
    }).then((res) => res.status),
  ).resolves.toEqual(406));

  it('Should return 500 on invalid content type conversions', () => expect(
    fetch(`http://localhost:${port}/jesse-quad`, {
      headers: new Headers({
        accept: 'text/turtle',
      }),
    }).then((res) => res.status),
  ).resolves.toEqual(500));

  it('Should return 500 on invalid content non-rdf files', () => expect(
    fetch(`http://localhost:${port}/bad-file`, {
      headers: new Headers({
        accept: 'text/turtle',
      }),
    }).then((res) => res.status),
  ).resolves.toEqual(500));
}

describe('Testing rdfServe library export', () => {
  let app: http.Server;

  beforeAll(() => {
    app = rdfServe(path.join(__dirname, 'sample')).listen(3002);
  });

  afterAll(async () => {
    await new Promise((res) => { app.on('close', res); app.close(); });
  });

  testOnPort(3002);
});
