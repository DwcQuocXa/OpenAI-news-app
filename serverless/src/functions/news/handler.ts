import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { formatInternalServerErrorResponse, formatSuccessResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import NewsApiService from '../../service/news.service';
import { NewsSearchParameters } from '../../model/NewsEverythingParameters';
import { Language } from '../../model/Language';
import { SortBy } from '../../model/SortBy';

const newsApiService = new NewsApiService();

export const getNewsEverything = middyfy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const params = event.queryStringParameters;
        const newsApiParameters: NewsSearchParameters = {
            q: params.q,
            from: params.from,
            to: params.to,
            searchIn: 'title,description',
            language: Language.EN,
            sortBy: SortBy.POPULARITY,
            pageSize: 10,
            page: 1,
        };

        const response = await newsApiService.getNewsEverything(newsApiParameters);
        return formatSuccessResponse(response);
    } catch (e) {
        return formatInternalServerErrorResponse(e);
    }
});
