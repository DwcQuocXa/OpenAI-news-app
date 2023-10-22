import { Article } from './Article';

export interface GetNewsEverythingResponse {
    status: 'ok' | 'error';
    totalResults: number;
    articles: Article[];
}
