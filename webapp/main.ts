/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { enableProdMode, TRANSLATIONS, TRANSLATIONS_FORMAT, LOCALE_ID, ApplicationRef } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { enableDebugTools } from '@angular/platform-browser';
import { AppModule } from './app.module';
import { environment } from './environments/environment';

if (environment.production) {
    enableProdMode();
}

declare const require;
const loadlocaleProviders = (locale: string): any[] => {
    try {
        /* eslint-disable-next-line import/no-dynamic-require */
        const translations = require(`raw-loader!./locale/messages.${locale}.xlf`);
        return [
            { provide: TRANSLATIONS, useValue: translations },
            { provide: TRANSLATIONS_FORMAT, useValue: 'xlf' },
            { provide: LOCALE_ID, useValue: locale }
        ];
    } catch (e) {
        return null;
    }
};

const browserLocale = navigator.language.toLowerCase();
const simplifiedLocale = browserLocale.substr(0, browserLocale.indexOf('-'));

const localeProviders = loadlocaleProviders(browserLocale)
    || loadlocaleProviders(simplifiedLocale) || [];

platformBrowserDynamic().bootstrapModule(AppModule, {
    providers: [
        ...localeProviders
    ]
}).then((moduleRef) => {
    if (!environment.production) {
        const applicationRef = moduleRef.injector.get(ApplicationRef);
        const appComponent = applicationRef.components[0];
        enableDebugTools(appComponent);
    }
});
