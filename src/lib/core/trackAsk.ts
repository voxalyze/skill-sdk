import { RequestHandler, HandlerInput } from 'ask-sdk-core';
import debugLib from 'debug';
import { InvalidHandlerError } from './Errors';
import { config } from './config';

/**
 * Debug logger for this component.
 */
const debug = debugLib('voxalyze-sdk:wrapper:ask');

/**
 * Possible input types the ASK wrapper accepts.
 */
type WrapperInput = RequestHandler | Function;

/**
 * Possible output types based on the input scenario.
 */
type WrapperOutput = WrapperInput | RequestHandler[];

/**
 * Utility function that checks if the provided object is an ASK handler object.
 * Used to determine if we get a plain function or an actual handler object.
 *
 * @param o The object to check
 */
function isAskSDKList(o: any): o is RequestHandler {
  return o.canHandle !== undefined;
}

/**
 * The re-usable wrapper that invokes the dispatcher and handler in a Promise.all.
 * Returns the result of the original function once both promises have been resolved.
 *
 * @param this The context
 * @param handler The handler function to invoke
 * @param input Handler input data
 */
async function askHandler(
  this: any,
  handler: Function,
  input: HandlerInput
): Promise<any> {
  debug('Invoking wrapped ASK handler');

  const res = await Promise.all([
    config.dispatch(input.requestEnvelope),
    handler.call(this, input),
  ]);

  debug('Finalized tracking and handler invocations');
  return res[1];
}

/**
 * Wraps a handler object that should be added with `addRequestHandlers`.
 * The handler object has a `canHandle` key which contains a function
 * determining if the handler is able to handler the input and a
 * `handler` key which contains the actual handler function.
 *
 * @param origHandler The original request handler object
 */
function wrapAsk(origHandler: RequestHandler): RequestHandler {
  debug('Wrapping ASK handler from list');
  if (!isAskSDKList(origHandler)) throw new InvalidHandlerError();

  return {
    async canHandle(this: any, input: HandlerInput): Promise<any> {
      debug('Invoking wrapped ASK canHandle function');
      return origHandler.canHandle.call(this, input);
    },
    async handle(this: any, input: HandlerInput): Promise<any> {
      return askHandler.call(this, origHandler.handle, input);
    },
  };
}

/**
 * Wraps a single handler function that is added with `addRequestHandler`.
 *
 * @param origHandler The original handler function
 * @returns The wrapped function
 */
function wrapAskSingle(origHandler: Function): Function {
  debug('Wrapping single ASK handler function');

  return async function(this: any, input: HandlerInput): Promise<any> {
    return askHandler.call(this, origHandler, input);
  };
}

/**
 * Wraps ASK-SDK handler functions and invokes them and the Voxalyze
 * event dispatcher in parallel. This function can take different inputs:
 *
 * A list of handlers inside the SkillBuilder's `addRequestHandlers` function args:
 * @example
 * ```js
 * Alexa.SkillBuilders.standard()
 *   .addRequestHandlers(
 *     ...Voxalyze.track(
 *       LaunchRequest,
 *       RegionIntent,
 *       NameIntent,
 *     ),
 *     HelpIntent,
 *     CancelOrStopIntent,
 *     SessionEndedRequest,
 *     FallbackIntent
 *   )
 * ```
 *
 * A single or multiple handler objects inside the `addRequestHandlers` function args:
 * individually wrapped.
 * @example
 * ```js
 * Alexa.SkillBuilders.standard()
 *   .addRequestHandlers(
 *     Voxalyze.track(LaunchRequest),
 *     Voxalyze.track(CancelOrStopIntent),
 *     SessionEndedRequest,
 *     FallbackIntent
 *   )
 * ```
 *
 * A single handler function in the `addRequestHandler` function args:
 * @example
 * ```js
 * Alexa.SkillBuilders.standard()
 *   .addRequestHandler(matcher, Voxalyze.track(handler));
 * ```
 *
 * @param args A list of ASK handler objects or a single handler function
 * @returns The expected handler function output for ASK-SDK
 */
export const track = (...args: WrapperInput[]): WrapperOutput => {
  if (args.length === 1 && !isAskSDKList(args[0])) {
    return wrapAskSingle(args[0]);
  }

  let askHandlers = args as RequestHandler[];
  askHandlers = askHandlers.map(wrapAsk);

  return args.length === 1 ? askHandlers[0] : askHandlers;
};
