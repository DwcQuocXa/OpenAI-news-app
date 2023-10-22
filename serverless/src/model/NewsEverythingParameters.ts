import { Language } from './Language';
import { SortBy } from './SortBy';

export interface NewsSearchParameters {
    q: string;
    searchIn?: string; // Optional field with a default value
    sources?: string;
    domains?: string;
    excludeDomains?: string;
    from?: string; // ISO 8601 format
    to?: string; // ISO 8601 format
    language?: Language;
    sortBy?: SortBy;
    pageSize?: number;
    page?: number;
}
