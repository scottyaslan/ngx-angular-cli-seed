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

import { environment as ENV, IS_PRODUCTION } from 'webapp/environments/environment';
import { NgModule, Provider } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { MAT_TOOLTIP_DEFAULT_OPTIONS } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { PlatformModule } from 'webapp/platform/platform.module';
import { KitchenSinkModule } from 'webapp/components/kitchen-sink/kitchen-sink.module';
import {
    STUBBED_DATA_INTERCEPTOR_CONFIGURATION,
    StubDataInterceptorService,
    REGISTER_STUBBED_ROUTES
} from 'webapp/platform/services/stub-data-interceptor.service';
import { registerEndpoints } from 'webapp/testing/stubbed-data-interceptor/endpoints';
import { AppRoutingModule } from './app.routes.module';
import { AppComponent } from './app.component';
import { ErrorInterceptorService } from './services/error-interceptor.service';
import { SidenavExampleModule } from './components/sidenav-example/sidenav-example.module';

const providers: Provider[] = [
    {
        provide: MAT_TOOLTIP_DEFAULT_OPTIONS,
        useValue: {
            showDelay: 500,
            hideDelay: 500
        }
    },
    {
        provide: STUBBED_DATA_INTERCEPTOR_CONFIGURATION,
        useValue: ENV.stubbedDataInterceptor
    },
    {
        provide: HTTP_INTERCEPTORS,
        useClass: ErrorInterceptorService,
        multi: true
    },
];

if (!IS_PRODUCTION && ENV.stubbedDataInterceptor.enabled) {
    providers.push({
        provide: REGISTER_STUBBED_ROUTES,
        useValue: registerEndpoints
    }, {
        provide: HTTP_INTERCEPTORS,
        useClass: StubDataInterceptorService,
        multi: true
    });
}

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        ...(!IS_PRODUCTION ? [KitchenSinkModule] : []),
        BrowserAnimationsModule,
        PlatformModule,
        MatIconModule,
        MatSidenavModule,
        RouterOutlet,
        SidenavExampleModule,
        MatButtonModule
    ],
    providers,
    bootstrap: [AppComponent]
})
export class AppModule {
    constructor() {
        // modify environment settings while running on the console, e.g.:
        // > environment  // shows the current settings
        // > environment.stubbedDataInterceptor.logging = true // enables logging of stubbed calls
        if (window) {
            (window as any).environment = ENV;
        }
    }
}
