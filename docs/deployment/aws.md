# Deploying to Amazon Web Services (AWS)

For AWS, deploying the Starlight Tech Radar using **AWS App Runner** is the most straightforward approach for containerized web applications. Alternatively, for more complex environments, AWS ECS (Fargate) is widely used.

Below is an example of deploying to AWS App Runner using the **AWS Cloud Development Kit (CDK)** in TypeScript.

## Prerequisites

- An AWS Account.
- [AWS CLI](https://aws.amazon.com/cli/) installed and configured.
- [Node.js](https://nodejs.org/) installed.
- [AWS CDK](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html) installed (`npm install -g aws-cdk`).
- The Docker image published to Amazon Elastic Container Registry (ECR).

## AWS CDK Configuration

1. Initialize a new CDK project (in a separate directory from your app, e.g., `infra/`):

   ```bash
   mkdir infra && cd infra
   cdk init app --language typescript
   ```

2. Install the necessary CDK libraries:

   ```bash
   npm install @aws-cdk/aws-apprunner-alpha
   ```

### Define the Stack (`lib/infra-stack.ts`)

```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apprunner from '@aws-cdk/aws-apprunner-alpha';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';

export class StarlightRadarStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Reference your existing ECR repository
    const repository = ecr.Repository.fromRepositoryName(this, 'RadarRepo', 'starlight-tech-radar');

    // Reference an existing Secret (e.g., created manually in AWS Console for GITHUB_TOKEN)
    const githubTokenSecret = secretsmanager.Secret.fromSecretNameV2(this, 'GithubToken', 'starlight/github-token');

    // App Runner Role to access ECR and Secrets
    const instanceRole = new iam.Role(this, 'AppRunnerInstanceRole', {
      assumedBy: new iam.ServicePrincipal('tasks.apprunner.amazonaws.com'),
    });
    githubTokenSecret.grantRead(instanceRole);

    // Create the App Runner Service
    const service = new apprunner.Service(this, 'StarlightRadarService', {
      serviceName: 'starlight-tech-radar',
      source: apprunner.Source.fromEcr({
        repository,
        tagOrDigest: 'latest',
        imageConfiguration: {
          port: 3000,
          environmentSecrets: {
            GITHUB_TOKEN: apprunner.Secret.fromSecretsManager(githubTokenSecret),
          },
        },
      }),
      instanceRole,
    });

    // Output the Service URL
    new cdk.CfnOutput(this, 'ServiceUrl', {
      value: `https://${service.serviceUrl}`,
    });
  }
}
```

## Deployment Steps

1. **Bootstrap CDK** (if this is your first time using CDK in this AWS account/region):

   ```bash
   cdk bootstrap
   ```

2. **Synthesize the CloudFormation template:**

   ```bash
   cdk synth
   ```

3. **Deploy the stack:**

   ```bash
   cdk deploy
   ```

AWS CDK will provision the App Runner service, configure IAM permissions, set up secrets injection, and output the public URL of your application.
