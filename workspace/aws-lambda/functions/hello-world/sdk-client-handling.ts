import { randomUUID } from 'node:crypto';

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

import { logger, tracer } from './powertools-util';

const s3client = tracer.captureAWSv3Client(new S3Client());

export async function s3PutObjectExample(targetBucket: string): Promise<void> {
  const body = {
    date: new Date().toISOString(),
    message: 'hello world',
  };
  const filename = `${randomUUID()}.json`;
  const path = `hello-world/putObjectExample/${filename}`;

  await s3client.send(
    new PutObjectCommand({
      Bucket: targetBucket,
      Key: path,
      Body: JSON.stringify(body),
    }),
  );

  logger.info(`success to create s3://${targetBucket}/${path}`);
}
