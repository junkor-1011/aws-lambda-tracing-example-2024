import { Stack, type StackProps, Tags } from 'aws-cdk-lib';
import type { Construct } from 'constructs';
import { SampleApp } from './workloads/app.constructs';

export class CdkAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new SampleApp(this, 'sample app');

    Tags.of(this).add('APPLICATION_NAME', 'sample-app');
  }
}
