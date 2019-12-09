import AWSMock from 'aws-sdk-mock';
import SQSDispatcher from '../src/lib/dispatchers/SQSDispatcher';
import launchRequestPayload from './fixtures/launchRequest';
import { responseOK } from './fixtures/sqsResponses';

jest.mock('axios');

let mockedErrConsole = jest.spyOn(global.console, 'error');

beforeEach(() => {
  AWSMock.restore();
  mockedErrConsole.mockReset();
});

test('Receive a success response from SQS', async () => {
  AWSMock.mock('SQS', 'sendMessage', (_params: any, cb: Function) => {
    cb(null, Promise.resolve(responseOK));
  });

  const dispatcher = new SQSDispatcher('http://localhost');
  await dispatcher.send(launchRequestPayload);
});

test('Receive an exception from SQS', async () => {
  AWSMock.mock('SQS', 'sendMessage', (_params: any, cb: Function) => {
    cb(new Error('MockedException'), undefined);
  });

  mockedErrConsole.mockImplementationOnce(message => {
    expect(message).toMatch('[VoxalyzeSDK][ERROR] Error: MockedException');
  });

  const dispatcher = new SQSDispatcher('http://localhost');
  await dispatcher.send(launchRequestPayload);
});
