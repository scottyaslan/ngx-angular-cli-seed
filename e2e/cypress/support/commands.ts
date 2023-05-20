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

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

// Must be declared global to be detected by typescript (allows import/export)
// eslint-disable @typescript/interface-name

export interface HttpRequestHistoryItem {
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
              * Custom command to select DOM element by data-qa attribute.
              * @example cy.getByDataQa('deployment-detail')
              * @example cy.getByDataQa('deployment-detail deployment-name') // select children
              */
            getByDataQa(qa: string, options?: any): Chainable<Element>;

            /**
              * Custom command to find a DOM elements which contains a given text in a given sub-element.
              * @example cy.getByDataQaContaining('flows-table-row', 'flow-name'. 'My Flow') // selects the row which contains 'My Flow'
              */
            getByDataQaContaining(collectionQa: string, searchQa: string, contains: string, options?: any): Chainable<Element>;

            /**
             * Custom commands to select an option in a mat-select.
             * @example cy.getByDataQa('select-environment').selectOption('-standalone-');
             */
            selectOption(optionText: string): void;
            selectGroupedOption(groupText: string, optionText: string): void;

            /**
             * Custom commands to clear and fill text fields
             * Cypress has an issue with its clear() commend, see: https://github.com/cypress-io/cypress/issues/2650
             *
             * @example cy.getByDataQa('select-environment').clearValue();
             * @example cy.getByDataQa('select-environment').clearAndFill('hello');
             */
            clearValue(): Chainable<Element>;
            clearAndFill(value: string): Chainable<Element>;

            /**
             * Custom command to select a file in a specified file input.
             * @example cy.selectJsonFile('input-import-flow-file', 'valid-nifi-flow.json');
             */
            selectJsonFile(fileInputSearchQa: string, fileName: string): void;

            /**
             * The next call of the given path and method will return with the given error.
             * Works on mocked environment only.
             * Calls prepareErrorResponse() of MockInterceptorService
             * @example cy.prepareMockErrorResponse('POST', 'catalog/flows', 500);
             */
            prepareMockErrorResponse(
                method: string,
                path: string,
                status: number,
                statusText?: string | null,
                error?: any
            ): void;

            /**
             * The next call of the given path and method will return with the given error.
             * Works on mocked environment only.
             * Calls prepareErrorResponse() of MockInterceptorService
             * @example cy.prepareMockErrorResponse('POST', 'catalog/flows', 500);
             */
            prepareMockExtraResponse(
                method: string,
                path: string,
                body?: any,
                status?: number
            ): void;

            // accessing request history in mock interceptor
            getLastMockedHttpRequest(): Chainable<HttpRequestHistoryItem>;
            getAllMockedHttpRequests(): Chainable<HttpRequestHistoryItem[]>;
            getMockedHttpRequest(method: string, url: string | RegExp): Chainable<HttpRequestHistoryItem>;
            getMockedHttpRequests(method: string, url: string | RegExp): Chainable<HttpRequestHistoryItem[]>;

            /**
             * sets te items per page in the paginator
             */
            setItemsPerPage(itemsPerPage: number): Chainable<Element>;
        }
    }
}

// converts 'foo bar' to '[data-qa=foo] [data-qa=bar]'
export const getQaSelector = (qas: string) => qas.split(' ')
    .map((qa) => `[data-qa=${qa}]`)
    .join(' ');

// a full match regex, allowing leading and trailing whitespaces only
// use in cy.contains() to avoid false positive matches
// e.g. cy.contains('1') finds '11' but cy.contains(fullMatch('1')) finds '1' (or '  1 ') only.
const fullMatch = (s: string) => new RegExp(`^\\s*${s}\\s\\(*\\w*\\)*\\s*$`, 'g');

Cypress.Commands.add('getByDataQa', (qa: string, options?: any) => cy
    .get(getQaSelector(qa), options));
Cypress.Commands.add('getByDataQaContaining', (collectionQa: string, searchQa: string, searchText: string, options?: any) => cy
    .get(getQaSelector(`${collectionQa} ${searchQa}`))
    // Cypress regexp search does not work on single element - seems to be a bug
    // (on the other hand if there is only one element found, then the simple text search
    // can be safe enough - so we can live this workaround I think)
    // .contains(fullMatch(searchText), options)
    .then(($e) => {
        if ($e.length === 1) {
            return cy.wrap($e).contains(searchText, options);
        }
        return cy.wrap($e).contains(fullMatch(searchText), options);
    })
    .parentsUntil('', getQaSelector(collectionQa)));
Cypress.Commands.add('selectOption', { prevSubject: true }, (subject, optionText: string) => cy
    .wrap(subject)
    .click()
    .get('.mat-select-panel')
    .contains('mat-option', optionText)
    .click());
Cypress.Commands.add('selectGroupedOption', { prevSubject: true }, (subject, groupText: string, optionText: string) => cy
    .wrap(subject)
    .click()
    .get('.mat-select-panel')
    .contains('mat-optgroup', groupText)
    .contains('mat-option', optionText)
    .click());
Cypress.Commands.add('clearValue', { prevSubject: true }, (subject) => cy
    .wrap(subject)
    .click()
    // we have to invoke this way because Cypress has an issue with clear().
    // details: https://github.com/cypress-io/cypress/issues/2650
    .invoke('val', '')
    .trigger('input'));
Cypress.Commands.add('clearAndFill', { prevSubject: true }, (subject, value: string) => cy
    .wrap(subject)
    .clearValue()
    .click()
    .type(value)
    .should('contain.value', value));
Cypress.Commands.add('selectJsonFile', (fileInputSearchQa: string, fileName: string) => cy
    .getByDataQa(fileInputSearchQa).then((subject: any) => {
        const fileInput = subject[0] as HTMLInputElement;
        cy.fixture(fileName).then((json) => {
            const dataTransfer = new DataTransfer();
            const testFile = new File([JSON.stringify(json)], fileName, { type: 'application/json' });
            dataTransfer.items.add(testFile);

            // eslint-disable-next-line no-param-reassign
            fileInput.files = dataTransfer.files;
            cy.wrap(fileInput).trigger('change', { force: true });
        });
    }));
Cypress.Commands.add('setItemsPerPage', (itemsPerPage: number) => cy
    .get(`mat-paginator mat-select`)
    .click()
    .get('.mat-select-panel')
    .contains('mat-option', itemsPerPage)
    .click());

// MOCK INTERCEPTOR INTEGRATION

Cypress.Commands.add('prepareMockErrorResponse', (method: string, path: string, status: number, statusText: string | null = null, error: any = null) => cy
    .window()
    .then((win) => {
        const { mockInterceptor } = win as any;
        if (mockInterceptor) {
            mockInterceptor.prepareErrorResponse(method, path, status, statusText, error);
        } else {
            console.error('Mock Interceptor is not available.');// eslint-disable-line no-console
        }
    }));
Cypress.Commands.add('prepareMockExtraResponse', (method: string, path: string, body: any = null, status: number = 200) => cy
    .window()
    .then((win) => {
        const { mockInterceptor } = win as any;
        if (mockInterceptor) {
            mockInterceptor.prepareExtraResponse(method, path, body, status);
        } else {
            console.error('Mock Interceptor is not available.'); // eslint-disable-line no-console
        }
    }));
Cypress.Commands.add('getLastMockedHttpRequest', () => cy
    .window()
    .then((win) => {
        const { mockInterceptor } = win as any;
        if (mockInterceptor) {
            return mockInterceptor.getHttpRequestHistory().getLatest() || null; // must return null instead of undefined, see https://docs.cypress.io/api/commands/then#Arguments
        }
        console.error('Mock Interceptor is not available.'); // eslint-disable-line no-console
        return null;
    }));
Cypress.Commands.add('getAllMockedHttpRequests', () => cy
    .window()
    .then((win) => {
        const { mockInterceptor } = win as any;
        if (mockInterceptor) {
            return mockInterceptor.getHttpRequestHistory().getAll() || null; // must return null instead of undefined, see https://docs.cypress.io/api/commands/then#Arguments
        }
        console.error('Mock Interceptor is not available.'); // eslint-disable-line no-console
        return null;
    }));
Cypress.Commands.add('getMockedHttpRequest', (method: string, url: string | RegExp) => cy
    .window()
    .then((win) => {
        const { mockInterceptor } = win as any;
        if (mockInterceptor) {
            return mockInterceptor.getHttpRequestHistory().get(method, url) || null; // must return null instead of undefined, see https://docs.cypress.io/api/commands/then#Arguments
        }
        console.error('Mock Interceptor is not available.'); // eslint-disable-line no-console
        return null;
    }));
Cypress.Commands.add('getMockedHttpRequests', (method: string, url: string | RegExp) => cy
    .window()
    .then((win) => {
        const { mockInterceptor } = win as any;
        if (mockInterceptor) {
            return mockInterceptor.getHttpRequestHistory().filter(method, url) || null; // must return null instead of undefined, see https://docs.cypress.io/api/commands/then#Arguments
        }
        console.error('Mock Interceptor is not available.'); // eslint-disable-line no-console
        return null;
    }));

// Convert this to a module instead of script (allows import/export)
export { };
