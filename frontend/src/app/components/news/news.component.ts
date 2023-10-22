import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NewsService } from '../../service/news.service';
import { GetNewsEverythingResponse } from '../../models/GetNewsEverythingResponse';
import { Article } from '../../models/Article';
import { DatePipe } from '@angular/common';
import { formatToFinnishDateAndTime } from '../../service/helper.service';

@Component({
    selector: 'app-news',
    templateUrl: './news.component.html',
    styleUrls: ['./news.component.scss'],
})
export class NewsComponent {
    searchForm!: FormGroup;
    total = 0;
    articles: Article[] = [];
    minDate: Date = new Date('01.01.1900');
    maxDate: Date = new Date('01.01.2100');

    constructor(private formBuilder: FormBuilder, private newsService: NewsService, private datePipe: DatePipe) {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        this.searchForm = this.formBuilder.group({
            q: '',
            from: yesterday,
            to: today,
        });
    }
    ngOnInit() {}

    search() {
        const parameters = {
            ...this.searchForm.value,
            from: this.datePipe.transform(this.searchForm.value.from, 'yyyy-MM-dd'),
            to: this.datePipe.transform(this.searchForm.value.to, 'yyyy-MM-dd'),
        };

        this.newsService.getNewsEverything(parameters).subscribe({
            next: (res: GetNewsEverythingResponse) => {
                console.log('res', res);
                this.articles = res.articles;
                this.total = res.totalResults;
                console.log(this.articles);
            },
            error: (err: any) => {
                console.error(err);
            },
        });
    }

    formatDate(date: string): string {
        if (!date) {
            return '';
        }
        return formatToFinnishDateAndTime(new Date(date));
    }
}
