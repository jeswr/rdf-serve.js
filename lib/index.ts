import express from 'express';
import fs from 'fs';
import Negotiator from 'negotiator';
import path from 'path';
import { allowedDestinations, getContentType, transform } from 'rdf-transform';
import RateLimit from 'express-rate-limit';

/**
 * Create an express handler that serves content negotiated files from a given
 * path
 * @param basePath The directory of the data files
 * @returns The express handler
 */
export function negotiateHandlerFactory(basePath: string) {
  return async function negotiateHandler(req: express.Request, res: express.Response) {
    const fileFolder = path.join(basePath, ...req.path.split('/').slice(0, -1));

    // First get the file name
    let fileName: string | undefined;

    try {
      fileName = fs
        .readdirSync(fileFolder)
        .find(
          (file) => req.path.slice(req.path.lastIndexOf('/') + 1) === file.slice(0, file.lastIndexOf('.')),
        );
    } catch (e) {
      return res
        .status(404)
        .send(
          'Not Found',
        )
        .end();
    }

    if (typeof fileName !== 'string') {
      return res.status(404).send('Not Found').end();
    }

    const fp = path.join(fileFolder, fileName);
    const sourceContentType = getContentType({ path: fp });

    if (sourceContentType === '') {
      return res
        .status(500)
        .send(
          'Internal Server Error: Requested resource is not a recognised RDF serialization',
        )
        .end();
    }

    // Then get the response content type
    const responseType = new Negotiator(req).mediaType(
      await allowedDestinations(sourceContentType),
    );

    if (typeof responseType !== 'string') {
      return res.status(406).send('Not Acceptable').end();
    }

    const responseStream = transform(fs.createReadStream(path.join(fp)), {
      from: { path: fp },
      to: { contentType: responseType },
      baseIRI: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
    });

    responseStream.on('error', (e) => {
      res
        .status(500)
        .send(`Internal server error transforming internal resource [${e}]\n`)
        .end();
    });

    return responseStream.pipe(
      res.status(200).setHeader('content-type', responseType),
    );
  };
}

/**
 * Create an express server that serves content negotiated files from a given
 * path
 * @param basePath The directory of the data files
 * @returns An express app
 */
export default function rdfServe(basePath: string) {
  const app = express();

  const limit = RateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute,
    max: 100,
  });

  app.use(limit);

  app.get('*', negotiateHandlerFactory(basePath));
  return app;
}
