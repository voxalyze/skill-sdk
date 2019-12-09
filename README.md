<img src="https://user-images.githubusercontent.com/573019/70381588-29a3d380-194d-11ea-9ed5-3e916c2c2a04.png" alt="drawing" width="200"/>

# Voxalyze SDK for Alexa Skills

![npm (scoped)](https://img.shields.io/npm/v/@voxalyze/skill-sdk?style=flat-square) ![GitHub](https://img.shields.io/github/license/voxalyze/skll-sdk?style=flat-square)

With Voxalyze, you can get real-time reports and insights about your Alexa skill visitors on multiple dimensions. This SDK reports meta-data from your Alexa Skill to our API. We match the data received from your skill with data we collect through our campaign proxy. This allows us to track where your visitors come from and which of your campaigns perform best.

## Contents

<!-- @import "[TOC]" {cmd="toc" depthFrom=2 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

- [Contents](#contents)
- [Installation](#installation)
- [Setup](#setup)
  - [Setting your API key](#setting-your-api-key)
  - [Tracking data with your ASK based skill](#tracking-data-with-your-ask-based-skill)
    - [Individually wrapping handler in the `addRequestHandlers` arguments](#individually-wrapping-handler-in-the-addrequesthandlers-arguments)
    - [Wrapping a list of handlers in `addRequestHandlers` arguments](#wrapping-a-list-of-handlers-in-addrequesthandlers-arguments)
    - [Wrapping a single handler function in the `addRequestHandler` arguments](#wrapping-a-single-handler-function-in-the-addrequesthandler-arguments)
  - [Tracking data for skills without ASK](#tracking-data-for-skills-without-ask)
- [Error handling](#error-handling)
- [Privacy and compliance](#privacy-and-compliance)
- [Debugging](#debugging)

<!-- /code_chunk_output -->

## Installation

To use the Voxalyze Skill SDK, first install it with npm or yarn:

```bash
$ npm install @voxalyze/skill-sdk
```

## Setup

The Voxalyze Skill SDK supports both plain Lambda function and handlers you define for the [ASK SDK](https://developer.amazon.com/docs/alexa-skills-kit-sdk-for-nodejs/overview.html). To get campaign attribution data, you should at least track your `LaunchRequest` handler. More information about about request types can be found in the [Alexa developer documentation](https://developer.amazon.com/docs/custom-skills/request-types-reference.html).

### Setting your API key

To get started, head to your Voxalyze account and create a new API key. Make sure the API key is available in the environment variables for your skill under the name `VXL_APIKEY`.

**Important: Setting API keys when deploying with ASK CLI**

Setting environment variables is currently not possible if you deploy directly with the ASK CLI. In this case, you can either manually add the environment variable to your Lambda after it is deployed or override the API key by mutating the SDK config directly (before you call any other Voxalyze function):

```js
Voxalyze.config.init({
  apiKey: '<YOU_API_KEY>',
});
```

While we do not recommend having API keys in your code, there is not fundamental security threat in this case due to the fact that your API keys can only send event reports, but cannot be used to access data from your account.

### Tracking data with your ASK based skill

The Voxalyze Skill SDK supports different ways to track your handlers. You can find the three different alternatives listed below.

#### Individually wrapping handler in the `addRequestHandlers` arguments

```js
const Alexa = require('ask-sdk');
const Voxalyze = require('@voxalyze/skill-sdk');

Voxalyze.config.init({
  apiKey: '<YOU_API_KEY>',
});

const skillBuilder = Alexa.SkillBuilders.standard();

module.exports.handler = skillBuilder
  .addRequestHandlers(
    Voxalyze.track(LaunchRequest),
    Voxalyze.track(NameIntent),
    HelpIntent,
    CancelOrStopIntent,
    SessionEndedRequest,
    FallbackIntent
  )
  .lambda();
```

Please be aware, that the tracker will not track function calls from the registered handler to another handler. So if you would manually call the `NameIntent` handler in our example from the `HelpIntent` handler, no data would be sent to Voxalyze since the sub-handler invocation was not wrapped by our tracker.

#### Wrapping a list of handlers in `addRequestHandlers` arguments

Simply wrap all or as many handlers as you want in your `addRequestHandlers` arguments.

```js
const Alexa = require('ask-sdk');
const Voxalyze = require('@voxalyze/skill-sdk');

Voxalyze.config.init({
  apiKey: '<YOU_API_KEY>',
});

const skillBuilder = Alexa.SkillBuilders.standard();

module.exports.handler = skillBuilder
  .addRequestHandlers(
    ...Voxalyze.track(
      LaunchRequest,
      NameIntent,
      HelpIntent,
      CancelOrStopIntent
    ),
    SessionEndedRequest,
    FallbackIntent
  )
  .lambda();
```

#### Wrapping a single handler function in the `addRequestHandler` arguments

If you add your request handler with the `addRequestHandler` method, you can simply wrap your handler function in the Voxalyze tracker.

```js
const Alexa = require('ask-sdk');
const Voxalyze = require('@voxalyze/skill-sdk');

Voxalyze.config.init({
  apiKey: '<YOU_API_KEY>',
});

const skillBuilder = Alexa.SkillBuilders.standard();

module.exports.handler = skillBuilder
  .addRequestHandler(matcher, Voxalyze.track(handler))
  .lambda();
```

### Tracking data for skills without ASK

If you don't use the ASK-SDK, you can also wrap your plain Lambda handler function with the Voxalyze SDK.

```js
const Voxalyze = require('@voxalyze/skill-sdk');

async function skillHandler(event, context) {
  // ...do something
}

module.exports.handler = Voxalyze.trackLambda(skillHandler);
```

In case you only want to track some specific invocations, simply add a proxy function that selects the handler your want to invoke for a specifc request type (e.g. LaunchRequest).

```js
const Voxalyze = require('@voxalyze/skill-sdk');

async function launchRequestHandler(event, context) {
  // ...do something
}

async function proxyHandler(event, context) {
  switch (event.request.type) {
    case 'LaunchRequest':
      return Voxalyze.trackLambda(launchRequestHandler);
    default:
      return otherHandler(event, context);
  }
}

module.exports.handler = proxyHandler;
```

## Error handling

The Voxalize Skill SDK will not block the execution of your skill code. If there is an error occurring in the SDK, it will be logged but not thrown.

## Privacy and compliance

The Voxalyze Skill SDK does not send any personally identifiable information (PII) to our servers. You are free to choose what handlers you want to track. Although you need to track at least the LaunchRequest handler to receive meaningful campaign attribution data. Below you can find an exact overview what data we collect through this SDK.

| Field       | Description                                                                                                                                                     |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| eventId     | A random ID, generated by the SDK for each event                                                                                                                |
| skillId     | The unique ID of your Alexa skill                                                                                                                               |
| userId      | The user ID for your skill user. This is no PII since the ID is unique per user/skill and gets regenerated everytime the user re-installs your skill            |
| deviceId    | The device ID for your skill user's device. This is no PII since the ID is unique per user/skill and gets regenerated everytime the user re-installs your skill |
| viewport    | Data on the device's screen type and sizes                                                                                                                      |
| requestType | The type of request, e.g. 'LaunchRequest'                                                                                                                       |
| requestId   | The Amazon request ID. Useful for tracing and error handling                                                                                                    |
| locale      | The device's locale, e.g. 'de-DE'                                                                                                                               |
| timestamp   | A timestamp when the event was triggered                                                                                                                        |

## Debugging

We use the [debug](https://www.npmjs.com/package/debug) package for debug log output. If you experience any issues, we recommend testing your skill handlers locally while activating the SDK's debug output:

```bash
$ DEBUG=voxalyze-sdk:* node index.js
```

Or on Windows:

```powershell
> set DEBUG=voxalyze-sdk:* & node index.js
```
