import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import { Construct } from 'constructs/lib/construct';
import { ManagedPolicy, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { BuildSpec, ComputeType, LinuxBuildImage, PipelineProject } from 'aws-cdk-lib/aws-codebuild';
import { CodeBuildAction, CodeBuildActionType, S3DeployAction } from 'aws-cdk-lib/aws-codepipeline-actions';
import { SubnetType } from 'aws-cdk-lib/aws-ec2';
import { Vpc } from 'aws-cdk-lib/aws-ec2/lib/vpc';
import { aws_ecs as ecs, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { CDKContext } from '../bin/_infrastructure';
import { Distribution } from 'aws-cdk-lib/aws-cloudfront';
import { Artifact, Pipeline } from 'aws-cdk-lib/aws-codepipeline';
import { readFileSync } from 'fs';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';

export interface FrontendPipelineStackProps extends StackProps {
    vpc: Vpc;
}

export class FrontendPipelineStack extends Stack {
    constructor(scope: Construct, id: string, context: CDKContext, props: FrontendPipelineStackProps) {
        super(scope, id, props);

        const config = JSON.parse(readFileSync(`./config/${context.environment}.json`).toString());

        const CODE_STAR_CONNECTION_ARN = config.CODE_STAR_CONNECTION_ARN as string;

        const { vpc } = props;

        const secret = Secret.fromSecretNameV2(
            this,
            `news-app-frontend-${context.environment}`,
            `news-app-frontend-${context.environment}`,
        );

        const buildRole = new Role(this, 'CodeBuildRole', {
            assumedBy: new ServicePrincipal('codebuild.amazonaws.com'),
            managedPolicies: [
                ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess'),
                ManagedPolicy.fromAwsManagedPolicyName('CloudFrontFullAccess'),
            ],
        });
        // Create a CodeBuild project to build and test the code
        const buildProject = new PipelineProject(this, 'BuildProject', {
            buildSpec: BuildSpec.fromSourceFilename('./frontend/buildspec.yml'),
            environment: {
                computeType: ComputeType.MEDIUM, // 7 GB memory, 4 vCPUs
                buildImage: LinuxBuildImage.STANDARD_6_0,
                privileged: true,
                environmentVariables: {
                    API_URL: { value: ecs.Secret.fromSecretsManager(secret, 'API_URL') },
                },
            },
            vpc,
            role: buildRole,
            subnetSelection: { subnetType: SubnetType.PRIVATE_WITH_EGRESS },
        });

        buildProject.addToRolePolicy(
            new PolicyStatement({
                actions: [
                    'codebuild:CreateReportGroup',
                    'codebuild:CreateReport',
                    'codebuild:BatchPutTestCases',
                    'codebuild:UpdateReport',
                ],
                resources: ['*'],
            }),
        );

        const websiteBucket = new Bucket(this, 'websiteBucket', {
            bucketName: `news-app-frontend-${context.environment}`,
            websiteIndexDocument: 'index.html',
            websiteErrorDocument: 'error.html',
            publicReadAccess: true,
            removalPolicy: RemovalPolicy.DESTROY,
            blockPublicAccess: {
                restrictPublicBuckets: false,
                blockPublicAcls: false,
                ignorePublicAcls: false,
                blockPublicPolicy: false,
            },
        });

        const distribution = new Distribution(this, `news-app-frontend-${context.environment}-distribution`, {
            defaultBehavior: {
                origin: new origins.S3Origin(websiteBucket),
            },
        });

        const invalidateBuildProject = new PipelineProject(this, `InvalidateProject`, {
            buildSpec: BuildSpec.fromObject({
                version: '0.2',
                phases: {
                    build: {
                        commands: [
                            'aws cloudfront create-invalidation --distribution-id ${CLOUDFRONT_ID} --paths "/*"',
                        ],
                    },
                },
            }),
            environmentVariables: {
                CLOUDFRONT_ID: { value: distribution.distributionId },
            },
        });

        const distributionArn = `arn:aws:cloudfront::${context.accountNumber}:distribution/${distribution.distributionId}`;
        invalidateBuildProject.addToRolePolicy(
            new PolicyStatement({
                resources: [distributionArn],
                actions: ['cloudfront:CreateInvalidation'],
            }),
        );

        const sourceOutput = new Artifact();
        const buildOutput = new Artifact();
        // Create a CodePipeline pipeline to orchestrate the build and deployment process
        const pipeline = new Pipeline(this, 'Pipeline', {
            pipelineName: `news-app-frontend-${context.environment}`,
            stages: [
                {
                    stageName: 'Source',
                    actions: [
                        new codepipeline_actions.CodeStarConnectionsSourceAction({
                            actionName: 'Github_Source',
                            owner: 'DwcQuocXa',
                            repo: 'news-app',
                            branch: 'master',
                            triggerOnPush: true,
                            connectionArn: CODE_STAR_CONNECTION_ARN,
                            output: sourceOutput,
                        }),
                    ],
                },
                {
                    stageName: 'Build',
                    actions: [
                        new CodeBuildAction({
                            actionName: 'CodeBuild',
                            project: buildProject,
                            input: sourceOutput,
                            outputs: [buildOutput],
                            type: CodeBuildActionType.BUILD,
                        }),
                    ],
                },
                {
                    stageName: 'Deploy',
                    actions: [
                        new S3DeployAction({
                            actionName: 'Deploy',
                            input: buildOutput,
                            bucket: websiteBucket,
                            runOrder: 1,
                        }),
                        new CodeBuildAction({
                            actionName: 'InvalidateCache',
                            project: invalidateBuildProject,
                            input: buildOutput,
                            runOrder: 2,
                        }),
                    ],
                },
            ],
        });
    }
}
