import { randomUUID } from 'node:crypto';

import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

import { logger, tracer } from './powertools-util';

const s3Client = tracer.captureAWSv3Client(new S3Client());
const dynamodbClient = tracer.captureAWSv3Client(new DynamoDBClient());

export async function s3PutObjectExample(targetBucket: string): Promise<void> {
  const body = {
    date: new Date().toISOString(),
    message: 'hello world',
  };
  const filename = `${randomUUID()}.json`;
  const path = `hello-world/putObjectExample/${filename}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: targetBucket,
      Key: path,
      Body: JSON.stringify(body),
    }),
  );

  logger.info(`success to create s3://${targetBucket}/${path}`);
}

export async function dynamodbScanExample(table: string): Promise<void> {
  const result = await dynamodbClient.send(
    new ScanCommand({
      TableName: table,
    }),
  );

  if (result.Items) {
    logger.info(`[ddb scan]get ${result.Items.length} items.`);
    for (const record of result.Items) {
      console.log(record);
    }
  } else {
    logger.info('[ddb scan]There are no items');
  }
}
