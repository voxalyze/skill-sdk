import uuid from 'uuid';
import log from '../core/log';

interface TrackingEventData {
  /**
   * The unique skill ID
   */
  skillId: string;

  /**
   * The skill based user ID
   */
  userId: string;

  /**
   * The skill based device ID
   */
  deviceId: string;

  /**
   * Arbitray viewport data. Used to track
   * what hardware a user might be using
   */
  viewport: any;

  /**
   * The original skill request ID. Used for
   * debugging only
   */
  requestId: string;

  /**
   * UTC timestamp showing when the Alexa request
   * was generated
   */
  timestamp: string;

  /**
   * The user's locale
   */
  locale: string;

  /**
   * The request type (e.g. LaunchRequest)
   */
  requestType?: string;
}

/**
 * Internal representation of an Alexa skill
 * request. This schema is required for compatibility
 * with the event collector. Data that does not adhere
 * to this schema might not be processed correctly or
 * dropped entirely
 */
export default class TrackingEvent {
  eventId: string;
  data: TrackingEventData;

  /**
   * Take the lambda event and maps it to the internal
   * event data format.
   * @param input The raw lambda event
   */
  constructor(input: any) {
    this.eventId = uuid.v4();
    this.data = {
      skillId: input.context?.System?.application?.applicationId,
      userId: input.context?.System?.user?.userId,
      deviceId: input.context?.System?.device?.deviceId,
      viewport: input.context?.Viewport,
      requestType: input.request?.type,
      requestId: input.request?.requestId,
      locale: input.request?.locale,
      timestamp: input.request?.timestamp,
    };

    if (!this.data.skillId) {
      log.error('Unable to create tracking event. Wrong data input.');
    }
  }

  json(): string {
    return JSON.stringify(this);
  }
}
