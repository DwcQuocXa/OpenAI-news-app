#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as branchName from 'current-git-branch';
import { VpcStack } from '../lib/vpc-stack';
import { FrontendPipelineStack } from '../lib/frontend-pipeline-stack';

export type CDKContext = {
    region: string;
    accountNumber: string;
    environment: string;
    branchName: string;
};

export const getContext = async (app: cdk.App): Promise<CDKContext> => {
    return new Promise(async (resolve, reject) => {
        try {
            const currentBranch = branchName();
            console.log(`Current git branch: ${currentBranch}`);

            const environment = app.node
                .tryGetContext('environments')
                .find((env: any) => currentBranch === env.branchName);
            console.log(`Environment: ${JSON.stringify(environment, null, 2)}`);

            return resolve({ ...environment });
        } catch (e) {
            console.error(e);
            return reject(e);
        }
    });
};

const createStacks = async () => {
    const app = new cdk.App();
    const context = await getContext(app);

    const vpcStack = new VpcStack(app, 'VpcStack', {
        env: {
            region: context.region,
            account: context.accountNumber,
        },
    });

    new FrontendPipelineStack(app, 'FrontendPipelineStack', context, {
        env: {
            region: context.region,
            account: context.accountNumber,
        },
        vpc: vpcStack.vpc,
    });
};

createStacks().then();
