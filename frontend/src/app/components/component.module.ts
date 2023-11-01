import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsComponent } from './news/news.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FieldsModule } from '../fields/fields.module';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DataViewModule } from 'primeng/dataview';
import { RatingModule } from 'primeng/rating';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { SplitterModule } from 'primeng/splitter';

@NgModule({
    declarations: [NewsComponent],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        FieldsModule,
        ButtonModule,
        CalendarModule,
        DataViewModule,
        RatingModule,
        TagModule,
        DividerModule,
        SplitterModule,
    ],
})
export class ComponentsModule {}
