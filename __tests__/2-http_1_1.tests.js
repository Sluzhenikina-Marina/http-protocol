import fs from 'fs';
import url from 'url';
import httpHeaders from 'http-headers';
import build from '../server/server.js';

test('should work', async () => {
  const app = build();

  const data = fs.readFileSync('solutions/2-http_1_1', 'utf-8');
  const requestObj = httpHeaders(
    data
      .split('\n')
      .map((el) => el.trim())
      .join('\r\n'),
  );

  expect(requestObj.version).toEqual({ major: 1, minor: 1 });

  const parts = {
    port: 8080,
    protocol: 'http',
    hostname: 'localhost',
    pathname: requestObj.url,
  };
  const requestUrl = url.format(parts);

  const headers = Object.entries(requestObj.headers)
    .reduce((acc, [header, value]) => (
      { ...acc, [header]: value.split(',').join('; ') }
    ), {});

  const { host } = headers;
  expect(host).toEqual('localhost');

  const options = {
    headers,
    method: requestObj.method,
    url: requestUrl,
  };

  const {
    raw: { req },
    statusCode: status,
    body,
  } = await app.inject(options);

  const { method } = req;
  const result = { method, status, body };
  expect(result).toMatchObject({ status: 200, method: 'GET', body: 'You\'ve done!' });
});
