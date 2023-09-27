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

import { environment as ENV } from 'webapp/environments/environment';
import { NgModule } from '@angular/core';
import { Routes, RouterModule, Router, NavigationEnd, NavigationStart } from '@angular/router';
import { filter } from 'rxjs/operators';
import { KitchenSinkComponent } from './components/kitchen-sink/kitchen-sink.component';

export function init(router: Router) {
    // logging error to console, because this swallows all routing errors during development
    // eg. DI error, missing module import, etc.
    // eslint-disable-next-line no-param-reassign
    router.errorHandler = (error) => {
        if (ENV.routing.logErrors) {
            // eslint-disable-next-line no-console
            console.log(error);
        }

        // uncomment this line to redirect to a '404'
        // router.navigateByUrl('/404', { replaceUrl: true });
    };

    if (ENV.routing.debug) {
        router.events.pipe(
            filter((event) => event instanceof NavigationEnd)
        ).subscribe((event: NavigationEnd) => {
            // eslint-disable-next-line no-console
            console.log('End Navigation', event.url);
        });

        router.events.pipe(
            filter((event) => event instanceof NavigationStart)
        ).subscribe((event: NavigationStart) => {
            // eslint-disable-next-line no-console
            console.log('Start Navigation', event.url);
        });
    }
}

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: '/kitchen-sink' },
    { path: 'kitchen-sink', component: KitchenSinkComponent }
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, { useHash: true })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
    constructor(
        router: Router
    ) {
        init(router);
    }
}
