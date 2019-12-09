import { Response as SkillResponse } from 'ask-sdk-model';
import debugLib from 'debug';
import { config } from './config';

/**
 * Debug logger signature for this component.
 */
const debug = debugLib('voxalyze-sdk:wrapper:lambda');

/**
 * Promsifies a callback style Lambda handler. Resolves,
 * if the sucess callback is called and rejects if the callback
 * error field is set.
 *
 * @param origHandler The original callback style handler
 * @param event The Lambda event
 * @param context The Lambda context
 */
function promisifiedHandler(
  origHandler: any,
  event: any,
  context?: AWSLambda.Context
) {
  debug('Promisifying callback style handler');
  return new Promise((resolve, reject) => {
    origHandler(event, context, (err: Error, res: any) => {
      if (err) reject(err);
      resolve(res);
    });
  });
}

/**
 * Takes a lambda handler and returns a new async handler that wraps
 * the original one. The original handler and the Voxalyze dispatcher
 * are resolved in parallel. This wrapper takes async and callback
 * style Lambda handler functions.
 *
 * @param origHandler The original handler
 */
export const trackLambda = (origHandler: any) => {
  debug('Wrapping Lambda handler function');

  const isAsync = origHandler.constructor.name === 'AsyncFunction';

  return async (
    event: any,
    context?: AWSLambda.Context,
    _callback?: AWSLambda.Callback
  ): Promise<SkillResponse> => {
    debug('Invoking wrapped Lambda handler');

    const res = await Promise.all([
      config.dispatcher!.send(event),
      isAsync
        ? origHandler(event, context)
        : promisifiedHandler(origHandler, event, context),
    ]);

    debug('Finalized tracking and handler invocations');
    return res[1];
  };
};
