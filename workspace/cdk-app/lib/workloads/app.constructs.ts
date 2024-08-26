import {
  Aws,
  RemovalPolicy,
  aws_dynamodb as dynamodb,
  aws_lambda as lambda,
  aws_s3 as s3,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class SampleApp extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new s3.Bucket(this, 'dummy output bucket', {
      bucketName: `dummy-output-bucket-${Aws.ACCOUNT_ID}-${Aws.REGION}`,
      removalPolicy: RemovalPolicy.DESTROY,
    });
  }
}
