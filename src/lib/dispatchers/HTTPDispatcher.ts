import axios, { AxiosResponse } from 'axios';
import debugLib from 'debug';
import log from '../core/log';
import Dispatcher from './Dispatcher';
import TrackingEvent from './TrackingEvent';

/**
 * Debug logger for this component.
 */
const debug = debugLib('voxalyze-sdk:dispatcher:http');

/**
 * Timeout in ms for the HTTP client.
 */
const HTTP_TIMEOUT = 5000;

/**
 * Dispatcher for sending events directly to the Voxalyze collector endpoint.
 */
export default class HTTPDispatcher implements Dispatcher {
  /**
   * The collector endpoint HTTP(S) address
   */
  endpoint: string;

  /**
   * Customer's API key for the collector endpoint
   */
  apiKey: string;

  /**
   * Constructs a new dispatcher instance with the specified
   * endpoint and apiKey.
   *
   * @param endpoint The collector andpoint address
   * @param apiKey The customer's API key
   */
  constructor(endpoint: string, apiKey: string) {
    this.endpoint = endpoint;
    this.apiKey = apiKey;

    debug('Created new HTTP Dispatcher for endpoint: ', this.endpoint);
  }

  /**
   * Sends the actual POST to the event collector endpoint.
   *
   * @param message The message to be sent
   */
  private post(message: TrackingEvent): Promise<AxiosResponse> {
    const url = `${this.endpoint}/v1/event/${message.data.skillId}`;
    debug(`Sending event data to ${url}`);

    return axios.post(url, message.data, {
      timeout: HTTP_TIMEOUT,
      headers: {
        'voxalyze-event-id': message.eventId,
        'x-api-key': this.apiKey,
      },
    });
  }

  /**
   * Creates a new `TrackingEvent` and sends it to the HTTP event
   * collector endpoint
   *
   * @param input Lambda or ASK handler input
   */
  async send(input: any): Promise<void> {
    debug('Received event payload for processing: ', input);

    try {
      const res = await this.post(new TrackingEvent(input));
      debug('Received response from HTTP collector endpoint: ', res);
    } catch (e) {
      log.error(
        `HTTP dispatch failed: ${e.response.status} ${e.response.statusText}`
      );
    }
  }
}
