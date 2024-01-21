import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Article } from '../models/Article';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    private apiUrl = environment.API_URL;
    constructor(private httpService: HttpClient) {}

    postNewsSummaryMessage(articles: Article[], searchInput: string): Observable<any> {
        const url = `${this.apiUrl}/dev/chat/summary`;
        return this.httpService.post(url, { articles, searchInput });
    }

    postNewMessage(
        message: string,
        searchInput: string,
        articles?: Article[],
        selectedArticle?: Article,
    ): Observable<any> {
        const url = `${this.apiUrl}/dev/chat/message`;
        return this.httpService.post(url, { articles, message, searchInput, selectedArticle });
    }

    postArticleSummaryMessage(selectedArticle: Article, searchInput: string): Observable<any> {
        const url = `${this.apiUrl}/dev/chat/article_summary`;
        return this.httpService.post(url, { selectedArticle, searchInput });
    }
}
