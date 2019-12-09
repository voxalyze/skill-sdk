import { AxiosError } from 'axios';

export const response200 = {
  data: {
    SequenceNumber: '1000000',
    ShardId: '0000001',
  },
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {},
  request: {},
};

export const response401: AxiosError = {
  config: {},
  name: 'Mocked Error',
  message: 'Mocked error message',
  code: '401',
  request: {},
  response: {
    data: null,
    status: 401,
    statusText: 'Unauthorized',
    headers: {},
    config: {},
    request: {},
  },
  isAxiosError: true,
};

export const response500: AxiosError = {
  config: {},
  name: 'Mocked Error',
  message: 'Mocked error message',
  code: '500',
  request: {},
  response: {
    data: null,
    status: 500,
    statusText: 'Internal Server Error',
    headers: {},
    config: {},
    request: {},
  },
  isAxiosError: true,
};
