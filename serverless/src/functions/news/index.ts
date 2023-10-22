import { handlerPath } from '@libs/handler-resolver';

export const getNewsEverything = {
    handler: `${handlerPath(__dirname)}/handler.getNewsEverything`,
    events: [
        {
            http: {
                method: 'get',
                path: 'news/everything/',
            },
        },
    ],
};
