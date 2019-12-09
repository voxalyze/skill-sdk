import { SQS } from 'aws-sdk';
import debugLib from 'debug';
import log from '../core/log';
import Dispatcher from './Dispatcher';
import TrackingEvent from './TrackingEvent';

/**
 * Debug logger for this component.
 */
const debug = debugLib('voxalyze-sdk:dispatcher:sqs');

/**
 * Timeout in ms for the SQS client.
 */
const SQS_TIMEOUT = 5000;

/**
 * Dispatcher for Amazon SNS based event tracking flow
 */
export default class SQSDispatcher implements Dispatcher {
  /**
   * SQS client instance
   */
  private _client: SQS;

  /**
   * The SQS queue URL
   */
  private _queue: string;

  /**
   * Constructs a new dispatcher instance for the specified
   * SQS queue.
   * @param queueUrl The target SQS queue
   */
  constructor(queueUrl: string) {
    this._queue = queueUrl;
    this._client = new SQS({
      httpOptions: { timeout: SQS_TIMEOUT },
    });

    debug('Created new SQS Dispatcher with queue URL: ', queueUrl);
  }

  /**
   * Takes an incoming Lambda or ASK event and extracts only the
   * data needed for tracking. The data and an event UUID
   * are published to the specified SQS queue. This function
   * always resolves, even if SQS fails.
   * @param event The Alexa event data
   * @returns A Promsise that always resolves
   */
  async send(input: any): Promise<void> {
    const message = new TrackingEvent(input).json();
    const params: SQS.Types.SendMessageRequest = {
      MessageBody: message,
      QueueUrl: this._queue,
    };

    try {
      const res = await this._client.sendMessage(params).promise();
      debug('Received response from SQS: ', res);
    } catch (e) {
      log.error(e);
    }
  }
}
