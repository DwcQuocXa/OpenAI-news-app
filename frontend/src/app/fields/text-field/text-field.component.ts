import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';

@Component({
    selector: 'app-text-field',
    templateUrl: './text-field.component.html',
    styleUrls: ['./text-field.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => TextFieldComponent),
            multi: true,
        },
    ],
})
export class TextFieldComponent implements OnInit {
    @Input() name!: string;
    @Input() maxlength!: number;
    @Input() readonly!: string;
    @Input() horizontal!: boolean;
    @Input() width!: number;
    @Input() disabled = false;
    @Input() hideLabel = false;
    @Input() required = false;

    formControl: FormControl = new FormControl();

    constructor() {}

    ngOnInit() {
        if (this.required) {
            this.formControl.addValidators(Validators.required);
        }

        if (this.maxlength) {
            this.formControl.addValidators(Validators.maxLength(this.maxlength));
        }

        if (this.disabled) {
            this.formControl.disable();
        }
    }

    writeValue(value: any) {
        this.formControl.setValue(value);
    }

    registerOnChange(fn: Function) {
        this.formControl.valueChanges.subscribe((val) => fn(val));
    }

    registerOnTouched(fn: Function) {
        this.formControl.valueChanges.subscribe((val) => fn(val));
    }

    getFieldLabel(): string {
        if (this.hideLabel) {
            return '';
        } else {
            return this.name;
        }
    }
}
