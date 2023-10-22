import { Component, forwardRef, Input } from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';

@Component({
    selector: 'app-date-field',
    templateUrl: './date-field.component.html',
    styleUrls: ['./date-field.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DateFieldComponent),
            multi: true,
        },
    ],
})
export class DateFieldComponent {
    @Input() name!: string;
    @Input() minDate!: Date;
    @Input() maxDate!: Date;
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

        if (this.maxDate) {
            this.formControl.addValidators(Validators.max(this.maxDate.getMilliseconds()));
        }

        if (this.minDate) {
            this.formControl.addValidators(Validators.min(this.minDate.getMilliseconds()));
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
