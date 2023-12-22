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
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { EntityService } from 'webapp/store/resources/entities/entity.service';
import { UiState } from 'webapp/store/app-store.module';
import { SingleSelectionService } from 'webapp/services/single-selection.service';
import { MoreToggleService } from 'webapp/services/more-toggle.service';

@Component({
    templateUrl: './sidenav-content.component.html',
    styleUrls: ['./sidenav-content.component.scss']
})
export class SidenavContentComponent implements OnInit, OnDestroy {
    protected apiUrl: string;
    protected store: Store<UiState> = inject(Store<UiState>);
    protected selectionService: SingleSelectionService = inject(SingleSelectionService);
    protected loading$ = this.entityService.loading$;
    protected moreToggle$ = signal(true);
    selection = this.selectionService.get();
    private componentDestroyed$ = new Subject<void>();

    constructor(
        protected activatedRoute: ActivatedRoute,
        protected entityService: EntityService,
        protected moreToggleService: MoreToggleService
    ) {
        this.apiUrl = ENV.apiUrl;
        moreToggleService.init(this.moreToggle$);
    }

    ngOnInit() {
        this.activatedRoute.params.pipe(
            takeUntil(this.componentDestroyed$)
        ).subscribe((params) => {
            this.reload(params.entityId);
        });
    }

    ngOnDestroy() {
        this.selectionService.clear();
        this.componentDestroyed$.next();
    }

    reload(id: string) {
        this.entityService.getByKey(id)
            .pipe(
                take(1)
            )
            .subscribe({
                next: (entity) => {
                    this.selectionService.select({
                        entity
                    });
                },
                error: (error) => {
                    this.selectionService.clear();
                    JSON.parse(JSON.stringify(error));
                }
            });
    }

    toggle(event: Event) {
        event.preventDefault();
        this.moreToggle$.set(!this.moreToggle$());
    }
}
