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

import { NgZone, Component } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TestBed, TestModuleMetadata } from '@angular/core/testing';
import { MatIconRegistry } from '@angular/material/icon';
import { Router, Routes } from '@angular/router';
import { FakeMatIconRegistry } from '@angular/material/icon/testing';

export function mapToStubbedEndpoints(originalRoutes: Routes): Routes {
    return originalRoutes.map((originalRoute) => ({
        ...originalRoute,
        children: originalRoute.children ? mapToStubbedEndpoints(originalRoute.children) : undefined,
        component: originalRoute.component ? MockComponent : undefined
    }));
}

// issue: https://github.com/angular/angular/issues/25837
export function fixRouterInTests() {
    const router = TestBed.inject(Router);
    if (router) {
        const originalInitialNavigation = router.initialNavigation;
        const originalNavigateByUrl = router.navigateByUrl;
        router.initialNavigation = (...options) => new NgZone({}).run(() => originalInitialNavigation.apply(router, options));
        router.navigateByUrl = (...options) => new NgZone({}).run(() => originalNavigateByUrl.apply(router, options));
    }
}

@Component({
    template: '<div></div>'
})
export class MockComponent { }

// configures Testbed WITHOUT routing and stubbed data interceptor
export function configureTestingModule(moduleDef: TestModuleMetadata): TestBed {
    return TestBed.configureTestingModule({
        ...moduleDef,
        declarations: [
            ...moduleDef.declarations || []
        ],
        providers: [
            ...moduleDef.providers || [],
            { provide: MatIconRegistry, useClass: FakeMatIconRegistry },
        ],
        imports: [
            ...moduleDef.imports || [],
            NoopAnimationsModule
        ],
        teardown: { destroyAfterEach: false }
    });
}
