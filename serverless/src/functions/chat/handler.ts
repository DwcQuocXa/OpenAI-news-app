import { middyfy } from '@libs/lambda';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { formatInternalServerErrorResponse, formatSuccessResponse } from '@libs/api-gateway';
import { ConversationalChatBot } from '../../service/chat.service';
import { RunnableSequence } from 'langchain/schema/runnable';
import { VectorStoreRetriever } from 'langchain/dist/vectorstores/base';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

let conversationalChatBot = new ConversationalChatBot(OPENAI_API_KEY);
let retriever: VectorStoreRetriever;
let chain: RunnableSequence;

export const postAllNewsSummaryMessage = middyfy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        try {
            const body = event.body as any;
            const searchInput = body.searchInput;

            //Turning the news title, description to vector store retriever

            retriever = await conversationalChatBot.articleStringToRetriever(JSON.stringify(body.articles));
            chain = await conversationalChatBot.createConversationalChain(retriever);

            const response = await chain.invoke({
                question: `What is the summary of all the context which is the news about ${searchInput} and the relevant information with a very clear and easy to read answer, please?`,
            });

            return formatSuccessResponse(response);
        } catch (e) {
            console.log('Error in postNewsSummary', e);
            return formatInternalServerErrorResponse(e);
        }
    },
);

export const postArticleSummaryMessage = middyfy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        try {
            const body = event.body as any;
            const searchInput = body.searchInput;
            const selectedArticle = body.selectedArticle;

            retriever = await conversationalChatBot.articleUrlToRetriever(selectedArticle.url);
            chain = await conversationalChatBot.createConversationalChain(retriever);

            const response = await chain.invoke({
                question: `What is the summary of the main content about ${searchInput} and the relevant information with a very clear and easy to read answer, please? The topic should be about ${selectedArticle.title}`,
            });
            return formatSuccessResponse(response);
        } catch (e) {
            console.log('Error in postNewMessage', e);
            return formatInternalServerErrorResponse(e);
        }
    },
);

export const postNewMessage = middyfy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const body = event.body as any;
        const searchInput = body.searchInput;
        const selectedArticle = body.selectedArticle;

        if (!retriever) {
            if (selectedArticle) {
                retriever = await conversationalChatBot.articleUrlToRetriever(selectedArticle.url);
            } else if (body.articles) {
                retriever = await conversationalChatBot.articleStringToRetriever(JSON.stringify(body.articles));
            }
        }

        if (!chain) {
            chain = await conversationalChatBot.createConversationalChain(retriever);
        }

        /*const additionalQuestionString = selectedArticle ? `The topic should be about ${selectedArticle.title}` : '';*/

        const response = await chain.invoke({
            question: `About ${searchInput} and the relevant information, ${body.message}`,
        });
        return formatSuccessResponse(response);
    } catch (e) {
        console.log('Error in postNewMessage', e);
        return formatInternalServerErrorResponse(e);
    }
});
