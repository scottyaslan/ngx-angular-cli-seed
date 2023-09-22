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

import { Injectable, InjectionToken, Inject } from '@angular/core';
import {
    HttpRequest,
    HttpErrorResponse,
    HttpHandler,
    HttpInterceptor,
    HttpEvent,
    HttpResponse,
    HTTP_INTERCEPTORS
} from '@angular/common/http';
import { Observable, of, Subject, throwError } from 'rxjs';
import { catchError, delay, switchMap, takeUntil, tap } from 'rxjs/operators';
import { TestBed } from '@angular/core/testing';
import { StubbedDataInterceptorConfiguration } from '../environments/environment.prod';

export const STUBBED_ERROR_RESPONSES = 'STUBBED_ERROR_RESPONSES';
export const STUBBED_EXTRA_RESPONSES = 'STUBBED_EXTRA_RESPONSES';

export abstract class EventStream<T> {
    protected destroyed$ = new Subject<void>();
    protected eventsSignal$ = new Subject<T>();
    events$ = this.eventsSignal$.pipe(
        takeUntil(this.destroyed$)
    );

    constructor(
        protected logging = false
    ) { }

    protected log(...params: any[]) {
        if (this.logging) {
            console.log('[Event Stream] ', ...params); // eslint-disable-line no-console
        }
    }

    protected destroy() {
        this.log('Event stream destroyed.');
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    abstract close(): void;
}

export class StubbedEventStream<T> extends EventStream<T> {
    constructor(
        mockEvents$: Observable<any>,
        delayTime: number = 1000,
        logging = false
    ) {
        super(logging);
        this.log('Creating a mocked event stream...');

        this.events$ = mockEvents$.pipe(
            delay(delayTime),
            takeUntil(this.destroyed$),
            catchError((error) => {
                this.log('An error occurred:', error);
                throw error;
            }),
            tap((data) => this.log('Event received:', data))
        );
    }

    close() {
        this.log('Closing mocked stream...');
        this.destroy();
    }
}

export interface RequestHistoryItem {
    method: string;
    urlWithParams: string;
    requestBody: object;
    responseBody: object;
}

/**
 * Intercepted http calls of the stubbed data interceptor
 */

export class RequestHistory {
    private items: RequestHistoryItem[] = [];

    add(item: RequestHistoryItem) {
        this.items.push(item);
    }

    getAll() {
        return this.items;
    }

    get(method: string, url: string | RegExp) {
        return this.items.find((i) => i.method === method && i.urlWithParams.match(url));
    }

    filter(method: string, url: string | RegExp) {
        return this.items.filter((i) => i.method === method && i.urlWithParams.match(url));
    }

    getLatest() {
        return this.items.length ? this.items[this.items.length - 1] : undefined;
    }

    clear() {
        this.items = [];
    }
}

export type StubbedMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'EVENT_STREAM';
export type StubbedRouteParams = object;
export type StubbedResponse = object[] | object;
export type StubbedRouteHandler = (match: StubbedRouteParams, request: HttpRequest<any>) => StubbedResponse;
export type StubbedEventStreamHandler = (match: StubbedRouteParams, url: string) => Observable<any>;
export type StubbedDataBase = object[];
export interface StubbedRoute {
    method: StubbedMethod;
    path: string;
    handler: StubbedRouteHandler | StubbedEventStreamHandler;
    delayTime?: number;
    sortKey?: string;
}
export interface StubbedMatchedRoute {
    route: StubbedRoute;
    response: HttpResponse<any>;
}

/* eslint-disable no-console */

export class StubbedDataRouter {
    registeredRoutes: StubbedRoute[] = [];
    private stubbedErrorResponses = new Map<string, HttpErrorResponse>(); // path => error
    private stubbedExtraResponses = new Map<string, HttpResponse<any>>(); // path => error

    constructor(private configuration: StubbedDataInterceptorConfiguration) {
        const preRegisteredErrorResponses = window[STUBBED_ERROR_RESPONSES];
        if (preRegisteredErrorResponses) {
            Object.values(preRegisteredErrorResponses).forEach((errorResponseObject) => {
                const { method, path, status, statusText, error } = errorResponseObject as any;
                this.scheduleStubbedErrorResponse(method, path, status, statusText, error);
                console.log('stubbedErrorResponse for', method, path, 'with', status, statusText, error);
            });
            delete window[STUBBED_ERROR_RESPONSES];
        }

        const preRegisteredExtraResponses = window[STUBBED_EXTRA_RESPONSES];
        if (preRegisteredExtraResponses) {
            Object.values(preRegisteredExtraResponses).forEach((extraResponseObject) => {
                const { method, path, status, body } = extraResponseObject as any;
                this.scheduleStubbedExtraResponse(method, path, body, status);
                console.log('stubbedExtraResponse for', method, path, 'with', status, body);
            });
            delete window[STUBBED_EXTRA_RESPONSES];
        }
    }

    // for serving custom routes
    registerRoute(method: StubbedMethod, path: string, handler: StubbedRouteHandler, delayTime?: number) {
        this.addRoute({ method, path, handler, delayTime });
    }

    // for serving static resources for constant paths
    // e.g. /languages  -> ['en', 'hu']
    registerStaticRoute(path: string, res: any) {
        this.addRoute({ method: 'GET', path, handler: () => res });
    }

    // for serving an entity from a collection
    // e.g. /item/1  -> {id: 1, title: 'Item 1']

    // returns an appropriate error when a special id 'ERROR-XXX' has been received
    // e.g. for id 'ERROR-403' mock interceptor wir return with a 403 Forbidden error.
    // If the requested entity is not found, it returns a 404 Not Found error.
    registerEntityRoute(path: string, db: StubbedDataBase, idInDb: string = 'id', idInPath: string = 'id') {
        this.addRoute({
            method: 'GET',
            path,
            handler: (params, request) => {
                const id = params[idInPath];
                if (id.startsWith('ERROR-')) {
                    throw this.createErrorResponse(request.url, +id.replace('ERROR-', ''));
                }
                const entity = db.find((item) => item[idInDb] === id);
                if (!entity) {
                    throw this.createErrorResponse(request.url, 404);
                }
                return entity;
            }
        });
    }

    // for serving SSE routes (server Sent Events)
    registerEventStreamRoute(path: string, handler: StubbedEventStreamHandler, delayTime?: number) {
        this.addRoute({ method: 'EVENT_STREAM', path, handler, delayTime });
    }

    private addRoute(route: StubbedRoute) {
        const enabled = this.configuration.enabled as boolean | string[];
        if (enabled === true || (
            Array.isArray(enabled) && enabled.includes(route.path)
        )) {
            if (this.configuration.logging) {
                console.log('Mock enabled:', route.path);
            }

            // compute sortKey by removing all except '/' and ':'
            // /res/:id/detail => //:/
            // eslint-disable-next-line no-param-reassign
            route.sortKey = route.path.replace(/[^/:]/gi, '');

            this.registeredRoutes.push(route);

            // sorting routes by specificity
            // e.g. /res/detail comes always before /res/:id
            // then parser can safely run the handler of the first match
            // eslint-disable-next-line no-nested-ternary
            this.registeredRoutes.sort((a, b) => ((a.sortKey < b.sortKey) ? -1 : ((a.sortKey > b.sortKey) ? 1 : 0)));
        } else if (this.configuration.logging) {
            console.log('Mock disabled:', route.path);
        }
    }

    matchRoute(path: string, route: StubbedRoute) {
        const routeMatcher = new RegExp(route.path.replace(/:[^\s/]+/g, '([\\w-%\\.]+)'));
        const paramValues = path.match(routeMatcher);
        if (!paramValues) {
            return null; // no match
        }
        const fullMatch = paramValues.shift();
        if (path !== fullMatch) {
            return null; // not full match
        }
        if (paramValues.length === 0) {
            return {}; // match without params
        }
        const paramNames = route.path.match(/:[^\s/]+/g);
        if (!paramNames || paramValues.length !== paramNames.length) {
            throw new Error('Cannot parse route path');
        }
        const params = {};
        paramNames.forEach((paramName, i) => { params[paramName.substr(1)] = paramValues[i]; });
        return params;
    }

    parse(request: HttpRequest<any>): StubbedMatchedRoute {
        try {
            const { method, url } = request;

            let response: StubbedResponse = null;
            let matchedRoute: StubbedRoute = null;

            const path = this.getPathFromUrl(url);
            if (path) {
                // searching for a stubbed error responses
                const preparedErrorResponse = this.stubbedErrorResponses.get(`${method}-${path}`);
                if (preparedErrorResponse) {
                    this.stubbedErrorResponses.delete(path);
                    throw preparedErrorResponse;
                }

                // searching for a stubbed extra responses
                const preparedExtraResponse = this.stubbedExtraResponses.get(`${method}-${path}`);
                if (preparedExtraResponse) {
                    this.stubbedExtraResponses.delete(path);
                    return {
                        response: preparedExtraResponse,
                        route: { method: method as StubbedMethod, path, handler: () => null }
                    };
                }

                // searching for a registered route
                this.registeredRoutes.forEach((route) => {
                    if (!response) {
                        const match = method === route.method && this.matchRoute(path, route);
                        if (match) {
                            response = (route.handler as StubbedRouteHandler)(match, request);
                            matchedRoute = route;
                        }
                    }
                });
            }

            return response && matchedRoute ? {
                response: new HttpResponse({ status: 200, body: structuredClone(response) }),
                route: matchedRoute
            } : { response: null, route: null };
        } catch (e) {
            // this is a mock error, which simulates a real server behavior, let's throw it...
            if (e instanceof HttpErrorResponse) {
                throw e;
            }

            // an error happened inside the stub data interceptor
            console.error('Error in stub data interceptor', e);
            return null;
        }
    }

    getEventSource<T>(url: string, logging = false): EventStream<T> {
        const path = this.getPathFromUrl(url);
        if (path) {
            // searching for a stubbed error response, see setStubbedErrorResponse()
            const preparedErrorResponse = this.stubbedErrorResponses.get(`EVENT_STREAM-${path}`);
            if (preparedErrorResponse) {
                return new StubbedEventStream<T>(
                    throwError(() => null),
                    this.configuration.delay,
                    logging
                );
            }

            // searching for a registered route
            let matchedRoute: StubbedRoute = null;
            let match;
            this.registeredRoutes.forEach((route) => {
                if (!matchedRoute) {
                    match = route.method === 'EVENT_STREAM' && this.matchRoute(path, route);
                    if (match) {
                        matchedRoute = route;
                    }
                }
            });

            if (matchedRoute) {
                return new StubbedEventStream<T>(
                    (matchedRoute.handler as StubbedEventStreamHandler)(match, url),
                    matchedRoute.delayTime ? Math.max(matchedRoute.delayTime, this.configuration.delay) : this.configuration.delay,
                    logging
                );
            }
        }
        return null;
    }

    private createHttpResponse(url: string, body: any = null, status: number = 200) {
        return new HttpResponse<any>({
            status,
            url,
            body: structuredClone(body)
        });
    }

    // removes the apiUrl and the leading and trailing '/' characters
    // http://my.com/api/list/12345/ => list/12345 (if apiUrl is http://my.com/api)
    private getPathFromUrl(url: string): string {
        const apiUrls = Array.isArray(this.configuration.apiUrl) ? this.configuration.apiUrl : [this.configuration.apiUrl];
        const apiUrl = apiUrls.find((u) => url.startsWith(u));

        if (apiUrl) {
            return url.substring(apiUrl.length).replace(/^\/|\/$/g, '');
        }
        return null;
    }

    // schedule an error response for a stubbed for a single use, it will be removed after returning it.
    scheduleStubbedErrorResponse(method: string, path: string, status: number, statusText: string = null, error: any = null) {
        const url = this.configuration.apiUrl + path;
        const key = `${method}-${path}`;
        this.stubbedErrorResponses.set(key, this.createErrorResponse(url, status, statusText, error));
    }

    // schedule a response for a stubbed for a single use, it will be removed after returning it
    scheduleStubbedExtraResponse(method: string, path: string, body: any = null, status: number = 200) {
        const url = this.configuration.apiUrl + path;
        const key = `${method}-${path}`;
        this.stubbedExtraResponses.set(key, this.createHttpResponse(url, body, status));
    }

    createErrorResponse(url: string, status: number, statusText: string = null, error: any = null): HttpErrorResponse {
        const getCommonStatusText = (s: number) => {
            switch (s) {
                case 400: return 'Invalid';
                case 401: return 'Not authorized';
                case 403: return 'Not Allowed';
                case 404: return 'Does Not Exist';
                case 500: return 'Server Error';
                default: return 'Unknown Error';
            }
        };

        return new HttpErrorResponse({
            status,
            statusText: statusText || getCommonStatusText(status),
            error: error || `A ${status} error created in mock interceptor.`,
            url
        });
    }
}

export const STUBBED_DATA_INTERCEPTOR_CONFIGURATION = new InjectionToken<StubbedDataInterceptorConfiguration>('STUBBED_DATA_INTERCEPTOR_CONFIGURATION');
export const REGISTER_STUBBED_ROUTES = new InjectionToken<(stubbedDataRouter: StubbedDataRouter) => void>('REGISTER_STUBBED_ROUTES');

@Injectable({
    providedIn: 'root'
})
export class StubDataInterceptorService implements HttpInterceptor {
    private stubbedDataRouter = new StubbedDataRouter(this.configuration);
    private history: RequestHistory;

    constructor(
        @Inject(REGISTER_STUBBED_ROUTES) readonly registerRoutes: any, // (stubbedDataRouter: StubbedDataRouter) => void, 'any' is used here due to AOT compilation errors
        @Inject(STUBBED_DATA_INTERCEPTOR_CONFIGURATION) private configuration: StubbedDataInterceptorConfiguration
    ) {
        registerRoutes(this.stubbedDataRouter);

        if (window && configuration.exposeToWindow) {
            // exposing stubbedDataInterceptor for Cypress e2e tests
            window['stubbedDataInterceptor'] = this;
        }

        if (configuration.enableRequestHistory) {
            this.history = new RequestHistory();
        }
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        try {
            const { response, route } = this.stubbedDataRouter.parse(request);
            if (response instanceof HttpResponse) {
                if (this.configuration.logging) {
                    // eslint-disable-next-line no-console
                    console.log(
                        'Stubbed endpoint: ',
                        request.method,
                        request.urlWithParams,
                        request.body,
                        response.body
                    );
                }
                if (this.history) {
                    this.history.add({
                        method: request.method,
                        urlWithParams: request.urlWithParams,
                        requestBody: request.body,
                        responseBody: response.body
                    });
                }
                return of(response).pipe(
                    delay(route.delayTime ? Math.max(route.delayTime, this.configuration.delay) : this.configuration.delay)
                );
            }
        } catch (error) {
            return of(null).pipe(
                delay(this.configuration.delay),
                switchMap(() => { throw error; })
            );
        }

        return next.handle(request);
    }

    getRequestHistory() {
        return this.history;
    }

    getEventSource<T>(url: string, logging = false): EventStream<T> {
        return this.stubbedDataRouter.getEventSource<T>(url, logging);
    }

    setStubbedErrorResponse(method: string, path: string, status: number, statusText: string = null, error: any = null) {
        this.stubbedDataRouter.scheduleStubbedErrorResponse(method, path, status, statusText, error);
    }

    setStubbedExtraResponse(method: string, path: string, body: any = null, status: number = 200) {
        this.stubbedDataRouter.scheduleStubbedExtraResponse(method, path, body, status);
    }
}

// accessing stubbed data interceptor from unit tests for enabling access to scheduleStubbedErrorResponse()
export const getStubbedDataInterceptor = (): StubDataInterceptorService => TestBed.inject(HTTP_INTERCEPTORS).find(
    (i) => i instanceof StubDataInterceptorService
) as StubDataInterceptorService;
