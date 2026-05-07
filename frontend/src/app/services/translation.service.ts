import { Injectable, signal } from '@angular/core';
import { ro, Translations } from '../i18n/ro';
import { en } from '../i18n/en';

export type Lang = 'ro' | 'en';

const TRANSLATIONS: Record<Lang, Translations> = { ro, en };

@Injectable({ providedIn: 'root' })
export class TranslationService {
  lang = signal<Lang>((localStorage.getItem('lang') as Lang) || 'ro');

  setLang(lang: Lang): void {
    this.lang.set(lang);
    localStorage.setItem('lang', lang);
  }

  t(path: string): string {
    const obj = TRANSLATIONS[this.lang()] as Record<string, any>;
    const result = path.split('.').reduce((cur: any, key: string) => cur?.[key], obj);
    return (typeof result === 'string' ? result : null) ?? path;
  }
}
