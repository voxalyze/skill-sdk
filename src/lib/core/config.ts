import Dispatcher from '../dispatchers/Dispatcher';
import SQSDispatcher from '../dispatchers/SQSDispatcher';
import HTTPDispatcher from '../dispatchers/HTTPDispatcher';
import { InvalidConfigurationError } from './Errors';
import log from './log';

export interface VoxalyzeSDKOptions {
  sqsQueue?: string;
  apiKey?: string;
}

/**
 * Encapsulated the package wide runtime configuration. Currently
 * the configuration can only be changed by setting the appropriate environment
 * variables.
 *
 * * `VXL_SQS_QUEUE`: The URL of the SQS queue if the SQS dispatcher should be used
 * * `VXL_APIKEY`: The customer API key in case the HTTP dispatcher should be used
 * * `VXL_ENDPOINT`: An optional override for the default HTTP collector endpoint
 */
export class Config {
  dispatcher?: Dispatcher;
  sqsQueue?: string;
  apiKey?: string;
  httpEndpoint = process.env.VXL_ENDPOINT || 'https://collector.voxalyze.com';

  /**
   * Constructs a new Config instance selects the appropriate dispatcher based
   * on the environment
   */
  constructor() {
    this.sqsQueue = process.env.VXL_SQS_QUEUE;
    this.apiKey = process.env.VXL_SQS_QUEUE;
    this.setDispatcher(true);
  }

  init(opts: VoxalyzeSDKOptions): void {
    this.sqsQueue = opts.sqsQueue;
    this.apiKey = opts.apiKey;
    this.setDispatcher();
  }

  async dispatch(input: any): Promise<void> {
    if (!this.dispatcher) {
      log.error(`No valid event dispatcher has been set`);
      return;
    }

    return this.dispatcher.send(input);
  }

  private setDispatcher(initial = false): void {
    if (this.sqsQueue) {
      this.dispatcher = new SQSDispatcher(this.sqsQueue);
    } else if (!initial || this.apiKey) {
      if (!this.apiKey) throw new InvalidConfigurationError('Missing API key');
      this.dispatcher = new HTTPDispatcher(this.httpEndpoint, this.apiKey);
    }
  }
}

export const config = new Config();
