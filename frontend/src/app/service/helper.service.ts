export function objectToQueryString(obj: any) {
    const keyValuePairs = [];
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            keyValuePairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
        }
    }
    return keyValuePairs.join('&');
}

export function formatToFinnishDateAndTime(value: Date | null | undefined) {
    if (typeof value === 'undefined' || value === null) {
        return '-';
    } else {
        const options: any = {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        };

        return new Intl.DateTimeFormat('fi-FI', options).format(value);
    }
}
