import type { AWS } from '@serverless/typescript';
import { getNewsEverything } from '@functions/news';
import { postArticleSummaryMessage, postNewMessage, postNewsSummaryMessage } from '@functions/chat';

const serverlessConfiguration: AWS = {
    service: 'news-app-serverless',
    frameworkVersion: '3',
    plugins: ['serverless-esbuild', 'serverless-offline', 'serverless-dotenv-plugin'],
    provider: {
        name: 'aws',
        runtime: 'nodejs14.x',
        timeout: 30,
        apiGateway: {
            minimumCompressionSize: 1024,
            shouldStartNameWithService: true,
        },
        httpApi: {
            cors: true,
        },
        environment: {
            AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
            NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
        },
        region: 'eu-west-1',
        /*iam: {
            role: {
                statements: [
                    {
                        Effect: 'Allow',
                        Action: ['execute-api:ManageConnections'],
                        Resource: 'arn:aws:execute-api:*:*:**!/@connections/!*',
                    },
                    {
                        Effect: 'Allow',
                        Action: [
                            'dynamodb:DescribeTable',
                            'dynamodb:Query',
                            'dynamodb:Scan',
                            'dynamodb:GetItem',
                            'dynamodb:PutItem',
                            'dynamodb:UpdateItem',
                            'dynamodb:DeleteItem',
                        ],
                        Resource: 'arn:aws:dynamodb:eu-west-1:*:table/ChatConnectionsTable',
                    },
                ],
            },
        },*/
    },
    // import the function via paths
    functions: { getNewsEverything, postNewsSummaryMessage, postNewMessage, postArticleSummaryMessage },
    package: { individually: true },
    custom: {
        esbuild: {
            bundle: true,
            minify: false,
            sourcemap: true,
            exclude: ['aws-sdk'],
            target: 'node14',
            define: { 'require.resolve': undefined },
            platform: 'node',
            concurrency: 10,
        },
    },
    useDotenv: true,
    /*resources: {
        Resources: {
            ChatConnectionsTable: {
                Type: 'AWS::DynamoDB::Table',
                Properties: {
                    TableName: 'ChatConnectionsTable',
                    AttributeDefinitions: [
                        {
                            AttributeName: 'connectionId',
                            AttributeType: 'S',
                        },
                    ],
                    KeySchema: [
                        {
                            AttributeName: 'connectionId',
                            KeyType: 'HASH',
                        },
                    ],
                    ProvisionedThroughput: {
                        ReadCapacityUnits: 5,
                        WriteCapacityUnits: 5,
                    },
                },
            },
        },
    },*/
};

module.exports = serverlessConfiguration;
