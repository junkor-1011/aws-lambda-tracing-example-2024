import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  Aws,
  Duration,
  RemovalPolicy,
  aws_dynamodb as dynamodb,
  aws_lambda as lambda,
  aws_s3 as s3,
} from 'aws-cdk-lib';
import {
  NodejsFunction,
  type NodejsFunctionProps,
  OutputFormat,
} from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const esmBanner =
  'import { createRequire as topLevelCreateRequire } from "node:module"; import url from "node:url"; const require = topLevelCreateRequire(import.meta.url); const __filename = url.fileURLToPath(import.meta.url); const __dirname = url.fileURLToPath(new URL(".", import.meta.url));';

const lambdaNodejsBundlingOption = {
  sourceMap: false,
  minify: true,
  format: OutputFormat.ESM,
  tsconfig: path.join(__dirname, '../../../aws-lambda/tsconfig.json'),
  banner: esmBanner,
  externalModules: ['@aws-sdk/*'],
} as const satisfies NodejsFunctionProps['bundling'];

export class SampleApp extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const bucket = new s3.Bucket(this, 'dummy output bucket', {
      bucketName: `dummy-output-bucket-${Aws.ACCOUNT_ID}-${Aws.REGION}`,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const table = new dynamodb.TableV2(this, 'sample table', {
      tableName: 'ddb-table-sample',
      partitionKey: { name: 'majorId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'minorId', type: dynamodb.AttributeType.NUMBER },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const helloWorldFunction = new NodejsFunction(
      this,
      'hello-world-function',
      {
        functionName: 'LF-hello-world',
        handler: 'handler',
        entry: path.join(
          __dirname,
          '../../../aws-lambda/functions/hello-world/index.ts',
        ),
        runtime: lambda.Runtime.NODEJS_20_X,
        bundling: lambdaNodejsBundlingOption,
        environment: {
          POWERTOOLS_LOG_LEVEL: 'DEBUG',
          POWERTOOLS_SERVICE_NAME: 'hello-world-function',
          POWERTOOLS_METRICS_NAMESPACE: 'LF-hello-world',
          TARGET_BUCKET: bucket.bucketName,
          TARGET_DYNAMODB_TABLE: table.tableName,
        },
        tracing: lambda.Tracing.ACTIVE,
        architecture: lambda.Architecture.ARM_64,
        timeout: Duration.seconds(10),
        memorySize: 256,
      },
    );
    bucket.grantWrite(helloWorldFunction);
    table.grantReadData(helloWorldFunction);
  }
}
