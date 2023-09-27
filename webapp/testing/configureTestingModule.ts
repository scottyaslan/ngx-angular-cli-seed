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

import { TestBed, TestModuleMetadata } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Router, Routes } from '@angular/router';
import { environment as ENV } from 'webapp/environments/environment';
import { registerEndpoints } from 'webapp/testing/stubbed-data-interceptor/endpoints';
import { ErrorInterceptorService } from 'webapp/services/error-interceptor.service';
import {
    REGISTER_STUBBED_ROUTES,
    STUBBED_DATA_INTERCEPTOR_CONFIGURATION,
    StubDataInterceptorService
} from 'webapp/platform/services/stub-data-interceptor.service';
import {
    configureTestingModule,
    fixRouterInTests,
    mapToStubbedEndpoints,
    MockComponent
} from 'webapp/platform/testing/configureTestingModule';
import { routes, init } from '../app.routes.module';

// configures Testbed WITH routing and stubbed data interceptor
export function fullyConfigureTestingModule(
    moduleDef: TestModuleMetadata,
    testRoutes: Routes = mapToStubbedEndpoints(routes),
): TestBed {
    const testBed = configureTestingModule({
        ...moduleDef,
        declarations: [
            ...moduleDef.declarations || [],
            MockComponent
        ],
        providers: [
            ...moduleDef.providers || [],
            {
                provide: HTTP_INTERCEPTORS,
                useClass: ErrorInterceptorService,
                multi: true
            },
            {
                provide: HTTP_INTERCEPTORS,
                useClass: StubDataInterceptorService,
                multi: true
            },
            {
                provide: STUBBED_DATA_INTERCEPTOR_CONFIGURATION,
                useValue: ENV.stubbedDataInterceptor
            },
            {
                provide: REGISTER_STUBBED_ROUTES,
                useValue: registerEndpoints
            }
        ],
        imports: [
            ...moduleDef.imports || [],
            MatDialogModule,
            RouterTestingModule.withRoutes(testRoutes),
            HttpClientTestingModule
        ]
    });

    init(TestBed.inject(Router));

    // issue: https://github.com/angular/angular/issues/25837
    fixRouterInTests();

    return testBed;
}
