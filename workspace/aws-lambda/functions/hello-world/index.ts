import 'source-map-support/register';

import { Logger } from '@aws-lambda-powertools/logger';
import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware';
import { MetricUnit, Metrics } from '@aws-lambda-powertools/metrics';
import { logMetrics } from '@aws-lambda-powertools/metrics/middleware';
import { Tracer } from '@aws-lambda-powertools/tracer';
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware';
import middy from '@middy/core';
import type { Context } from 'aws-lambda';

const tracer = new Tracer();
const logger = new Logger();
const metrics = new Metrics();

const lambdaHandler = async (
  _event: unknown,
  _context: Context,
): Promise<void> => {
  logger.debug('invoked.');

  try {
    const ipv4: string = await fetch('https://checkip.amazonaws.com/').then(
      (res) => res.text(),
    );

    logger.info(`ipv4: ${ipv4.trim()}`);

    metrics.addMetric('success', MetricUnit.Count, 1);
  } catch (err) {
    logger.error(`unexpected error occured: ${err}`);

    metrics.addMetric('failed', MetricUnit.Count, 1);
  }

  logger.debug('finish');
};

export const handler = middy(lambdaHandler)
  .use(captureLambdaHandler(tracer))
  .use(injectLambdaContext(logger))
  .use(logMetrics(metrics));
