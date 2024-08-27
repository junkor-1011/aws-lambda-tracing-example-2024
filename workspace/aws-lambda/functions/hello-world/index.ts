import process from 'node:process';

import 'source-map-support/register';

import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware';
import { MetricUnit } from '@aws-lambda-powertools/metrics';
import { logMetrics } from '@aws-lambda-powertools/metrics/middleware';
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware';
import middy from '@middy/core';
import type { Context } from 'aws-lambda';
import { logger, metrics, tracer } from './powertools-util';
import { dynamodbScanExample, s3PutObjectExample } from './sdk-client-handling';

const { TARGET_BUCKET, TARGET_DYNAMODB_TABLE } = (() => {
  const { TARGET_BUCKET, TARGET_DYNAMODB_TABLE } = process.env;

  if (TARGET_BUCKET === undefined) {
    throw new Error('env variable TARGET_BUCKET is not defined.');
  }
  if (TARGET_DYNAMODB_TABLE === undefined) {
    throw new Error('env variable TARGET_DYNAMODB_TABLE is not defined.');
  }

  return { TARGET_BUCKET, TARGET_DYNAMODB_TABLE } as const;
})() satisfies Record<string, string>;

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

    metrics.addMetric('ipv4-success', MetricUnit.Count, 1);
  } catch (err) {
    logger.error(`[ipv4]unexpected error occured: ${err}`);

    metrics.addMetric('failed to get ipv4', MetricUnit.Count, 1);
  }

  try {
    await s3PutObjectExample(TARGET_BUCKET);
  } catch (err) {
    logger.error(`[s3PutObject]unexpected error occured: ${err}`);
  }

  try {
    await dynamodbScanExample(TARGET_DYNAMODB_TABLE);
  } catch (err) {
    logger.error(`[ddb scan]unexpected error occured: ${err}`);
  }

  logger.debug('finish');
};

export const handler = middy(lambdaHandler)
  .use(captureLambdaHandler(tracer))
  .use(injectLambdaContext(logger))
  .use(logMetrics(metrics));
