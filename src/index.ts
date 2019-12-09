import { config } from './lib/core/config';
import { track } from './lib/core/trackAsk';
import { trackLambda } from './lib/core/trackLambda';

/**
 * Main entry point to the voxalyze SDK. For ease of use this
 * default export contains all publicly usable features.
 */
const sdk = {
  config,
  track,
  trackLambda,
};

export default sdk;
