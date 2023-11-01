import NewsAPI from 'newsapi';

export default class NewsApiService {
    private apiKey = process.env.NEWS_API_KEY;
    private newsApi = new NewsAPI(this.apiKey);

    async getNewsEverything(newsApiParameters) {
        return await this.newsApi.v2.everything(newsApiParameters);
    }
}
