import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { OptionValue } from '../../models/Option';

@Component({
    selector: 'app-select-field',
    templateUrl: './select-field.component.html',
    styleUrls: ['./select-field.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SelectFieldComponent),
            multi: true,
        },
    ],
})
export class SelectFieldComponent implements OnInit {
    @Input() name!: string;
    @Input() options!: OptionValue[];
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
