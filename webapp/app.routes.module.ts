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
import { Location } from '@angular/common';
import { Routes, RouterModule, Router, NavigationEnd, NavigationStart } from '@angular/router';
import { Observable, of, Subject } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { KitchenSinkComponent } from './components/kitchen-sink/kitchen-sink.component';
import { SidenavExampleComponent } from './components/sidenav-example/sidenav-example.component';
import { SidenavContentComponent } from './components/sidenav-example/sidenav-content/sidenav-content.component';

// This method does some history tricks to restore both Angular router and browser history to the original state
// It should be called within a Deactivate Guard.
// It returns an observable for steps that have to be done after any navigation here.
//
// canDeactivate(component: KPIsComponent, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot) {
//     const deactivationAllowed = ...; // should we allow to leave this state or not?
//     if (!deactivationAllowed) {
//         this.routingHelperService.blockRouteDeactivation(currentState.url)
//             .subscribe(() => {
//                 // do anything AFTER any navigation here have been complete
//                 // e.g. show a dialog
//             });
//     }
//     return deactivationAllowed;)
//
// See also: https://github.com/angular/angular/issues/13586
export function blockRouteDeactivation(currentStateUrl: string): Observable<void> {
    const { trigger } = this.router.getCurrentNavigation();

    // browser events: BACK, FORWARD, manual url change
    // In this case history has been already changed when Angular gets the control.
    if (trigger === 'popstate') {
        if (this.isBackWardNavigation) {
            // the current entry is already removed from the history
            // we should add it again to keep history unchanged
            this.location.go(currentStateUrl);
        } else {
            // either by pressing FORWARD button or by manually editing the url in the address bar
            // the new entry is already in the history, we have to remove it
            this.location.back();
        }

        // returning an observable which fires after the navigation here is complete
        return this.urlChanged.pipe(take(1));
    }

    // navigation inside angular app: clicking links and buttons, etc...
    // (trigger === 'imperative')
    // In this case history is not yet modified,
    // router url should be fixed (Angular issue)
    this.router.navigateByUrl(currentStateUrl, { skipLocationChange: true });

    // no real navigation happened, following steps can be done immediately
    return of(undefined);
}

// The window beforeunload handler to warn user if there are changes before allowing the user to refresh the page.
// Usage:
//
//     @HostListener('window:beforeunload', ['$event'])
//     unloadHandler(event: BeforeUnloadEvent) {
//         if (!this.isFormDirty) {
//             return unloadConfirmation(event, 'All progress will be lost. Are you sure you want to cancel?');
//         }
//     }

export const unloadConfirmation = ($event: BeforeUnloadEvent, message: string): string => {
    // Cancel the event as stated by the standard.
    $event.preventDefault();
    // Gecko + IE
    // eslint-disable-next-line no-param-reassign
    ($event || window.event).returnValue = message;
    // Safari, Chrome, and other WebKit-derived browsers
    return message;
};

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: '/sidenav-example' },
    {
        path: 'kitchen-sink',
        component: KitchenSinkComponent,
        data: {
            title: 'Kitchen Sink'
        }
    },
    {
        path: 'sidenav-example',
        component: SidenavExampleComponent,
        data: {
            title: 'Sidenav Example'
        },
        children: [
            {
                path: 'entities/:entityId',
                component: SidenavContentComponent,
                data: {
                    title: 'Entity'
                }
            }
        ]
    }
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, { useHash: true })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
    private urlChanged = new Subject<void>();
    // a helper array for window.history (historyOfNavigationIds.length === windows.history.length)
    // we store navigation ids (from NavigationStart event) for each history item
    //
    // if the event contains a restoredState.navigationId property,
    // then we know that it is a FORWARD or BACK navigation,
    // and by searching for the referenced navigation id in historyOfNavigationIds
    // we can determine the new index in the array (currentHistoryIndex)
    // finally by comparing new and old indexes we can detect the direction of the navigation
    // if this is a BACK navigation, we set isBackWardNavigation flag for later use in blockRouteDeactivation().
    private historyOfNavigationIds: number[] = [];
    private currentHistoryIndex = -1;
    private isBackWardNavigation: boolean = null;

    constructor(
        private router: Router,
        private location: Location
    ) {
        location.onUrlChange(() => {
            this.urlChanged.next();
        });

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

        // Tracking navigation will enable us to find out the type of the popstate event.
        // If the history index decreases, event will be classified as backward navigation.
        // We need this to properly handle popstate events
        let historyIndex;
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationStart) {
                historyIndex = this.currentHistoryIndex;
                const previousIndex = this.currentHistoryIndex;

                if (event.restoredState) {
                    // this is a backward or a forward navigation, we can find the previous state and set history index
                    historyIndex = this.historyOfNavigationIds.findIndex((i) => i === event.restoredState.navigationId);
                } else {
                    // this is a new history item
                    historyIndex++;
                }
                this.isBackWardNavigation = historyIndex < previousIndex;
            } else if (event instanceof NavigationEnd) {
                // a guard can block the navigation, then currentHistoryIndex and historyOfNavigationIds
                // should remain unchanged in this case
                // so we write currentHistoryIndex and historyOfNavigationIds only in NavigationEnd
                // which won't be called id a navigation is blocked by a guard
                this.historyOfNavigationIds[historyIndex] = event.id;
                this.currentHistoryIndex = historyIndex;
                historyIndex = null;
                this.isBackWardNavigation = null;
            }
        });
    }
}
