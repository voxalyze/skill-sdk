import * as AWSMock from 'aws-sdk-mock';
import { ResponseEnvelope } from 'ask-sdk-model';
import { trackLambda, voxalyzeConfig } from '../src';
import testResponse from './fixtures/skillTestResponse';
import launchRequest from './fixtures/launchRequest';

AWSMock.mock('SQS', 'sendMessage', (_params: any, cb: Function) => {
  cb(null, {});
});

voxalyzeConfig.init({ sqsQueue: 'http://localhost' });

test('Wrap async handler function with success response', async () => {
  async function testHandler(_event: any): Promise<any> {
    return testResponse;
  }

  const res = await trackLambda(testHandler)(launchRequest);

  expect(res).toMatchObject(testResponse);
});

test('Wrap async handler function with exception', async () => {
  const mockError = new Error('MockError');

  async function testHandler(_event: any): Promise<any> {
    throw mockError;
  }

  try {
    await trackLambda(testHandler)(launchRequest);
  } catch (e) {
    expect(e).toMatchObject(mockError);
  }
});

test('Wrap callback handler function with success response', async () => {
  function testHandler(_event: any, _context: any, cb: Function) {
    cb(null, testResponse);
  }

  const res = await trackLambda(testHandler)(
    launchRequest,
    {},
    (_err: Error, _res: ResponseEnvelope) => {
      throw new Error('Should not be called');
    }
  );

  expect(res).toMatchObject(testResponse);
});

test('Wrap callback handler function with error response', async () => {
  const mockError = new Error('MockError');

  function testHandler(_event: any, _context: any, cb: Function) {
    cb(mockError, null);
  }

  try {
    await trackLambda(testHandler)(
      launchRequest,
      {},
      (_err: Error, _res: ResponseEnvelope) => {
        throw new Error('Should not be called');
      }
    );
  } catch (e) {
    expect(e).toMatchObject(mockError);
  }
});
