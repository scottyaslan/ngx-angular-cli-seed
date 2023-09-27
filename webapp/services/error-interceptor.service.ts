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

import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { EMPTY, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Error<T = any> {
    status: number;
    message: string;
    title?: string;
    errorMessages?: string[];
    data?: T; // any data associated with the errors to be passed to application
}

interface JsonBodyErrorResponse {
    errorMessages?: string[];
}

// handle responses with status 401
export const HANDLE_401_RESPONSE = new InjectionToken<() => {}>('HANDLE_401_RESPONSE');

@Injectable({
    providedIn: 'root'
})
export class ErrorInterceptorService implements HttpInterceptor {
    constructor(
        private router: Router,
        @Optional() @Inject(HANDLE_401_RESPONSE) private handle401Response: () => {}
    ) {
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(
            catchError((httpError: HttpErrorResponse) => {
                const { status } = httpError;

                if ((status === 401) && this.handle401Response) {
                    this.handle401Response();
                    return EMPTY;
                }

                if (status === 503) {
                    const contentType = httpError.headers.get('Content-Type');
                    if (contentType.includes('text/html')) {
                        // uncomment to redirect to a custom 503 page
                        // this.router.navigateByUrl('/503');
                    }
                }

                if (status === 504) {
                    // uncomment to redirect to a custom 504 page
                    // this.router.navigateByUrl('/504');
                    return EMPTY;
                }

                // 413 Request payload or 431 Request Header Fields exceed maximum server limit
                if (status === 413 || status === 431) {
                    const error: Error = {
                        status,
                        message: 'The maximum server request payload has been exceeded.'
                    };
                    return throwError(error);
                }

                // client-side error
                if (httpError.error instanceof ErrorEvent) {
                    const error: Error = {
                        status: -1,
                        message: httpError.error.message
                    };
                    return throwError(error);
                }

                // text/plain type error message in body of Response
                if (httpError.error && typeof httpError.error === 'string') {
                    const error: Error = {
                        status,
                        message: httpError.error
                    };
                    return throwError(error);
                }

                // a json body with error messages
                if (httpError.error && typeof httpError.error === 'object'
                    && httpError.error.errorMessages && httpError.error.errorMessages.length) {
                    const jsonBodyErrorResponse: JsonBodyErrorResponse = httpError.error;
                    // for components that do not support jsonBodyErrorResponse creating an error message
                    const { errorMessages } = jsonBodyErrorResponse;
                    const message = errorMessages.join(' ');

                    const error: Error = {
                        status,
                        message,
                        errorMessages
                    };
                    return throwError(error);
                }

                // using httpError.message as the error message
                const error: Error = {
                    status,
                    message: httpError.message
                };
                return throwError(error);
            })
        );
    }
}
