import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { objectToQueryString } from './helper.service';
import { environment } from '../../environment/environment.development';

@Injectable({
    providedIn: 'root',
})
export class NewsService {
    private apiUrl = environment.apiUrl;
    constructor(private httpService: HttpClient) {}
    getNewsEverything(parameters: any): Observable<any> {
        const queryParameters = objectToQueryString(parameters);
        const url = `${this.apiUrl}/dev/news/everything?${queryParameters}`;
        return this.httpService.get(url);
    }
}
