import type { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from 'aws-lambda';
import type { FromSchema } from 'json-schema-to-ts';

type ValidatedAPIGatewayProxyEvent<S> = Omit<APIGatewayProxyEvent, 'body'> & {
    body: FromSchema<S>;
};
export type ValidatedEventAPIGatewayProxyEvent<S> = Handler<ValidatedAPIGatewayProxyEvent<S>, APIGatewayProxyResult>;

const formatResponse = (statusCode: number, data: any) => {
    return {
        statusCode,
        body: JSON.stringify(data),
        headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Credentials': true },
    };
};

// Format a successful response (e.g., 200 OK)
export const formatSuccessResponse = (data: any) => {
    return formatResponse(200, data);
};

// Format a resource not found response (e.g., 404 Not Found)
export const formatNotFoundResponse = (e) => {
    return formatResponse(404, e);
};

// Format a bad request response (e.g., 400 Bad Request)
export const formatBadRequestResponse = (e) => {
    return formatResponse(400, e);
};

// Format an internal server error response (e.g., 500 Internal Server Error)
export const formatInternalServerErrorResponse = (e) => {
    return formatResponse(500, e);
};
