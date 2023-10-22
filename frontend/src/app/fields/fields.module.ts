import { NgModule } from '@angular/core';
import { MultiSelectModule } from 'primeng/multiselect';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { TextFieldComponent } from './text-field/text-field.component';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { SelectFieldComponent } from './select-field/select-field.component';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { PasswordModule } from 'primeng/password';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DateFieldComponent } from './date-field/date-field.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MultiSelectModule,
        DropdownModule,
        InputTextModule,
        InputMaskModule,
        InputNumberModule,
        CalendarModule,
        PasswordModule,
        InputSwitchModule,
        InputTextareaModule,
        FormsModule,
        ReactiveFormsModule,
    ],
    declarations: [TextFieldComponent, SelectFieldComponent, DateFieldComponent],
    exports: [TextFieldComponent, SelectFieldComponent, DateFieldComponent],
})
export class FieldsModule {}
