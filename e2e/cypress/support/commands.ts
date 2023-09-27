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

// eslint-disable @typescript/interface-name

const STUBBED_ERROR_RESPONSES = 'STUBBED_ERROR_RESPONSES';
const STUBBED_EXTRA_RESPONSES = 'STUBBED_EXTRA_RESPONSES';

export interface RequestHistory {
    method: string;
    urlWithParams: string;
    requestBody: object;
    responseBody: object;
}

declare global {
    // eslint-disable-next-line no-redeclare
    namespace Cypress {
        interface Chainable<Subject> { // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
            /**
             * Custom command to select DOM element by data-it attribute
             */
            getByDataIt(identifier: string, options?: any): Chainable<Element>;

            /**
             * find a DOM elements which contains a given text in a sub-element.
             */
            getByDataItContaining(collection: string, search: string, contains: string, options?: any): Chainable<Element>;

            /**
             * schedule an error after a successful request
             */
            nextRequestStubbedErrorResponse(
                method: string,
                path: string,
                status: number,
                statusText?: string | null,
                error?: any
            ): void;

            /**
             * schedule a response after a successful request
             */
            nextRequestStubbedExtraResponse(
                method: string,
                path: string,
                body?: any,
                status?: number
            ): void;

            /**
             * set stubbed data response for a given endpoint before any requests.
             */
            prePageLoadStubbedErrorResponse(
                method: string,
                path: string,
                status: number,
                statusText?: string | null,
                error?: any
            ): void;

            /**
             * set stubbed error response for a given endpoint before any requests.
             */
            prePageLoadStubbedExtraResponse(
                method: string,
                path: string,
                body?: any,
                status?: number
            ): void;

            // accessing request history in Stub Data Interceptor
            getLastRequest(): Chainable<RequestHistory>;
            getAllRequests(): Chainable<RequestHistory[]>;
            getRequest(method: string, url: string | RegExp): Chainable<RequestHistory>;
            getRequests(method: string, url: string | RegExp): Chainable<RequestHistory[]>;
        }
    }
}

// converts 'foo bar' to '[data-it=foo] [data-it=bar]'
export const getItSelector = (identifiers: string) => identifiers.split(' ')
    .map((identifier) => `[data-it=${identifier}]`)
    .join(' ');

// a full match regex, allowing leading and trailing whitespaces only
// use in cy.contains() to avoid false positive matches
// e.g. cy.contains('1') finds '11' but cy.contains(fullMatch('1')) finds '1' (or '  1 ') only.
const fullMatch = (s: string) => new RegExp(`^\\s*${s}\\s\\(*\\w*\\)*\\s*$`, 'g');

// @ts-ignore
Cypress.Commands.add('getByDataIt', (identifier: string, options?: any) => cy
    .get(getItSelector(identifier), options));
// @ts-ignore
Cypress.Commands.add('getByDataItContaining', (collection: string, search: string, searchText: string, options?: any) => cy
    .get(getItSelector(`${collection} ${search}`))
    .then(($e) => {
        if ($e.length === 1) {
            return cy.wrap($e).contains(searchText, options);
        }
        return cy.wrap($e).contains(fullMatch(searchText), options);
    })
    .parentsUntil('', getItSelector(collection)));

// STUBBED DATA INTERCEPTOR INTEGRATION

Cypress.Commands.add('nextRequestStubbedErrorResponse', (method: string, path: string, status: number, statusText: string | null = null, error: any = null) => cy
    .window()
    .then((win) => {
        const { stubbedDataInterceptor } = win as any;
        if (stubbedDataInterceptor) {
            stubbedDataInterceptor.scheduleStubbedErrorResponse(method, path, status, statusText, error);
        } else {
            console.error('Stub Data Interceptor is not available.');// eslint-disable-line no-console
        }
    }));
Cypress.Commands.add('nextRequestStubbedExtraResponse', (method: string, path: string, body: any = null, status: number = 200) => cy
    .window()
    .then((win) => {
        const { stubbedDataInterceptor } = win as any;
        if (stubbedDataInterceptor) {
            stubbedDataInterceptor.scheduleStubbedExtraResponse(method, path, body, status);
        } else {
            console.error('Stub Data Interceptor is not available.'); // eslint-disable-line no-console
        }
    }));
Cypress.Commands.add('prePageLoadStubbedErrorResponse', (method: string, path: string, status: number, statusText: string | null = null, error: any = null) => cy
    .on('window:before:load', (win: any) => {
        const key = `${method}-${path}`;
        // eslint-disable-next-line no-param-reassign
        win[STUBBED_ERROR_RESPONSES] = win[STUBBED_ERROR_RESPONSES] || {};
        // eslint-disable-next-line no-param-reassign
        win[STUBBED_ERROR_RESPONSES][key] = { method, path, status, statusText, error };
    }));
Cypress.Commands.add('prePageLoadStubbedExtraResponse', (method: string, path: string, body: any = null, status: number = 200) => cy
    .on('window:before:load', (win: any) => {
        const key = `${method}-${path}`;
        // eslint-disable-next-line no-param-reassign
        win[STUBBED_EXTRA_RESPONSES] = win[STUBBED_EXTRA_RESPONSES] || {};
        // eslint-disable-next-line no-param-reassign
        win[STUBBED_EXTRA_RESPONSES][key] = { method, path, body, status };
    }));
Cypress.Commands.add('getLastRequest', () => cy
    .window()
    .then((win) => {
        const { stubbedDataInterceptor } = win as any;
        if (stubbedDataInterceptor) {
            return stubbedDataInterceptor.getRequestHistory().getLatest() || null; // must return null instead of undefined, see https://docs.cypress.io/api/commands/then#Arguments
        }
        console.error('Stub Data Interceptor is not available.'); // eslint-disable-line no-console
        return null;
    }));
Cypress.Commands.add('getAllRequests', () => cy
    .window()
    .then((win) => {
        const { stubbedDataInterceptor } = win as any;
        if (stubbedDataInterceptor) {
            return stubbedDataInterceptor.getRequestHistory().getAll() || null; // must return null instead of undefined, see https://docs.cypress.io/api/commands/then#Arguments
        }
        console.error('Stub Data Interceptor is not available.'); // eslint-disable-line no-console
        return null;
    }));
Cypress.Commands.add('getRequest', (method: string, url: string | RegExp) => cy
    .window()
    .then((win) => {
        const { stubbedDataInterceptor } = win as any;
        if (stubbedDataInterceptor) {
            return stubbedDataInterceptor.getRequestHistory().get(method, url) || null; // must return null instead of undefined, see https://docs.cypress.io/api/commands/then#Arguments
        }
        console.error('Stub Data Interceptor is not available.'); // eslint-disable-line no-console
        return null;
    }));
Cypress.Commands.add('getRequests', (method: string, url: string | RegExp) => cy
    .window()
    .then((win) => {
        const { stubbedDataInterceptor } = win as any;
        if (stubbedDataInterceptor) {
            return stubbedDataInterceptor.getRequestHistory().filter(method, url) || null; // must return null instead of undefined, see https://docs.cypress.io/api/commands/then#Arguments
        }
        console.error('Stub Data Interceptor is not available.'); // eslint-disable-line no-console
        return null;
    }));

export { };
