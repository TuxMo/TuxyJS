import {fileURLToPath} from 'url';
import path from 'path';
import http from 'http';

import Tuxy from '@tuxmo/tuxy';

describe('Integration', () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  let _server = null;
  let _tuxy = null;

  beforeEach(() => {
    _tuxy = new Tuxy(path.join(__dirname));
    _server = _tuxy.start();
  });

  afterEach((done) => {
    if (_server && _server.close) {
      _server.close(() => {
        _server = null;
        done();
      });
    }
  });

  it('server can start', () => {
    expect(_server.listening).toBeTruthy();
    expect(_server.address().port).toBe(6000);
  });

  it("wires test controller and it's actions", (done) => {
    http.get('http://localhost:6000/test', (response) => {
      let body = '';
      response.on('data', (chunk) => body += chunk);
      response.on('end', () => {
        expect(JSON.parse(body)).toEqual({type: 'TestController'});
        done();
      });
    }).on('error', (e) => done(e));
  }, 100);
});
