import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NewsService } from '../../service/news.service';
import { GetNewsEverythingResponse } from '../../models/GetNewsEverythingResponse';
import { Article } from '../../models/Article';
import { DatePipe } from '@angular/common';
import { formatToFinnishDateAndTime } from '../../service/helper.service';
import { map, mergeMap } from 'rxjs';
import { ChatMessage } from '../../models/ChatMessage';
import { ChatSender } from '../../models/ChatSender';
import { ChatService } from '../../service/chat.service';

@Component({
    selector: 'app-news',
    templateUrl: './news.component.html',
    styleUrls: ['./news.component.scss'],
})
export class NewsComponent {
    searchForm!: FormGroup;
    inputForm!: FormGroup;
    total = 0;
    articles: Article[] = [];
    minDate: Date = new Date('01.01.1900');
    maxDate: Date = new Date('01.01.2100');
    chatMessages: ChatMessage[] = [];
    selectedArticle!: Article;
    @ViewChild('scrollMe') private myScrollContainer!: ElementRef;

    constructor(
        private formBuilder: FormBuilder,
        private newsService: NewsService,
        private datePipe: DatePipe,
        private chatService: ChatService,
    ) {}
    ngOnInit() {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        this.searchForm = this.formBuilder.group({
            q: '',
            from: yesterday,
            to: today,
        });
        this.inputForm = this.formBuilder.group({
            input: '',
        });
    }

    search() {
        const parameters = {
            ...this.searchForm.value,
            from: this.datePipe.transform(this.searchForm.value.from, 'yyyy-MM-dd'),
            to: this.datePipe.transform(this.searchForm.value.to, 'yyyy-MM-dd'),
        };

        this.chatMessages = [];

        this.onNewChatMessage({
            time: new Date(),
            sender: ChatSender.USER,
            content: 'Can you summarize the news?',
        });

        this.newsService
            .getNewsEverything(parameters)
            .pipe(
                map((response: GetNewsEverythingResponse) => {
                    this.articles = response.articles;
                    this.total = response.totalResults;
                    return response.articles;
                }),
                mergeMap((articles) => this.chatService.postNewsSummaryMessage(articles, this.searchForm.value.q)),
            )
            .subscribe({
                next: (response) => {
                    this.onNewChatMessage({
                        time: new Date(),
                        sender: ChatSender.GPT,
                        content: response.result,
                    });
                },
                error: (error) => {
                    console.log(error);
                },
            });
    }

    sendMessage() {
        this.onNewChatMessage({
            time: new Date(),
            sender: ChatSender.USER,
            content: this.inputForm.value.input,
        });
        this.chatService
            .postNewMessage(this.inputForm.value.input, this.searchForm.value.q, this.articles, this.selectedArticle)
            .subscribe({
                next: (response) => {
                    console.log('response', response);
                    this.onNewChatMessage({
                        time: new Date(),
                        sender: ChatSender.GPT,
                        content: 'Rephrased question: ' + response.rephrasedQuestion,
                    });
                    this.onNewChatMessage({
                        time: new Date(),
                        sender: ChatSender.GPT,
                        content: response.result,
                    });
                },
                error: (error) => {
                    console.log(error);
                },
            });

        this.inputForm.patchValue({ input: '' });
    }

    selectArticleToChat(article: Article) {
        this.selectedArticle = article;

        this.onNewChatMessage({
            time: new Date(),
            sender: ChatSender.USER,
            content: 'Give me summary of this news',
        });

        this.chatService.postArticleSummaryMessage(this.selectedArticle, this.searchForm.value.q).subscribe({
            next: (response) => {
                this.onNewChatMessage({
                    time: new Date(),
                    sender: ChatSender.GPT,
                    content: response.result,
                });
            },
            error: (error) => {
                console.log(error);
            },
        });

        this.inputForm.patchValue({ input: '' });
    }

    formatDate(date: string): string {
        if (!date) {
            return '';
        }
        return formatToFinnishDateAndTime(new Date(date));
    }

    scrollToBottom(): void {
        try {
            this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
        } catch (err) {}
    }

    onNewChatMessage(chatMessage: ChatMessage) {
        this.chatMessages.push(chatMessage);
        this.scrollToBottom();
    }
}
