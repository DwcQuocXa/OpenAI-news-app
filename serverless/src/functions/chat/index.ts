import { handlerPath } from '@libs/handler-resolver';

export const postNewsSummaryMessage = {
    handler: `${handlerPath(__dirname)}/handler.postNewsSummaryMessage`,
    events: [
        {
            http: {
                method: 'post',
                path: 'chat/summary',
                cors: true,
            },
        },
    ],
    timeout: 30,
};

export const postNewMessage = {
    handler: `${handlerPath(__dirname)}/handler.postNewMessage`,
    events: [
        {
            http: {
                method: 'post',
                path: 'chat/message',
                cors: true,
            },
        },
    ],
    timeout: 30,
};

export const postArticleSummaryMessage = {
    handler: `${handlerPath(__dirname)}/handler.postArticleSummaryMessage`,
    events: [
        {
            http: {
                method: 'post',
                path: 'chat/article_summary',
                cors: true,
            },
        },
    ],
    timeout: 30,
};
