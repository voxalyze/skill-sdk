import axios from 'axios';
import HTTPDispatcher from '../src/lib/dispatchers/HTTPDispatcher';
import launchRequestPayload from './fixtures/launchRequest';
import {
  response200,
  response401,
  response500,
} from './fixtures/collectorResponses';

jest.mock('axios');

let mockedAxios = axios as jest.Mocked<typeof axios>;
let mockedErrConsole = jest.spyOn(global.console, 'error');

beforeEach(() => {
  mockedAxios.post.mockReset();
  mockedErrConsole.mockReset();
});

test('Reveive a 200 response from the collector', async () => {
  mockedAxios.post.mockResolvedValue(response200);

  const dispatcher = new HTTPDispatcher('http://localhost', 'testkey');
  await dispatcher.send(launchRequestPayload);

  expect(mockedAxios.post).toBeCalledTimes(1);
  mockedAxios.post.mockReset();
});

test('Reveive a 401 response from the collector', async () => {
  mockedAxios.post.mockRejectedValueOnce(response401);
  mockedErrConsole.mockImplementationOnce(message => {
    expect(message).toMatch(
      '[VoxalyzeSDK][ERROR] HTTP dispatch failed with status 401'
    );
  });

  const dispatcher = new HTTPDispatcher('http://localhost', 'testkey');
  await dispatcher.send(launchRequestPayload);

  expect(mockedAxios.post).toBeCalledTimes(1);
});

test('Reveive a 500 response from the collector', async () => {
  mockedAxios.post.mockRejectedValueOnce(response500);
  mockedErrConsole.mockImplementationOnce(message => {
    expect(message).toMatch(
      '[VoxalyzeSDK][ERROR] HTTP dispatch failed with status 500'
    );
  });

  const dispatcher = new HTTPDispatcher('http://localhost', 'testkey');
  await dispatcher.send(launchRequestPayload);

  expect(mockedAxios.post).toBeCalledTimes(1);
});
