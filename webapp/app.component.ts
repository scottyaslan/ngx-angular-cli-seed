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

import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { setAppSidenavState, selectAppSidenavIsOpen } from './store/ui-state/app-sidenav-context';
import { UiState } from './store/app-store.module';

export interface Breadcrumb {
    label: string;
    clicked?: () => void;
}

@Component({
    selector: 'webapp',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    isAppSideNavOpen$: Observable<boolean> = this.store.select(selectAppSidenavIsOpen);
    pageTitle: Observable<Breadcrumb[]>;

    constructor(
        private store: Store<UiState>,
        private activatedRoute: ActivatedRoute,
    ) {}

    onPageActivate() {
        this.pageTitle = this.activatedRoute.snapshot.firstChild.data.title;
    }

    openSidenav() {
        this.store.dispatch(setAppSidenavState({ isOpen: true }));
    }

    closeSidenav() {
        this.store.dispatch(setAppSidenavState({ isOpen: false }));
    }

    closeIconKeyDown(event: KeyboardEvent) {
        const { key } = event;

        switch (key) {
            case ' ':
            case 'Enter':
                event.preventDefault();
                this.closeSidenav();
                break;
            default:
        }
    }

    click(event: MouseEvent, breadcrumb: Breadcrumb) {
        event.preventDefault();
        breadcrumb.clicked();
    }
}
