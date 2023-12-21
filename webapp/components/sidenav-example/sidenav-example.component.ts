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
import { Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { UiState } from 'webapp/store/app-store.module';
import { AppRoutingService } from 'webapp/app.routing.service';
import { EntityService } from 'webapp/store/resources/entities/entity.service';
import { Entity } from 'webapp/testing/stubbed-data-interceptor/endpoints/entities/data';
import { selectSidenavIsOpen, setSidenavState } from 'webapp/store/ui-state/sidenav-context';
import { SingleSelectionService } from 'webapp/services/single-selection.service';

@Component({
    templateUrl: './sidenav-example.component.html',
    styleUrls: ['./sidenav-example.component.scss']
})
export class SidenavExampleComponent implements OnInit {
    protected store: Store<UiState> = inject(Store<UiState>);
    protected selectionService: SingleSelectionService = inject(SingleSelectionService);
    selection = this.selectionService.get();
    protected apiUrl: string;
    protected loading$ = this.entityService.loading$;
    protected entities: any = [];
    displayedColumns: string[] = ['action', 'id', 'name'];
    isSideNavOpen$: Observable<boolean> = this.store.select(selectSidenavIsOpen);

    constructor(
        private appRoutingService: AppRoutingService,
        protected entityService: EntityService
    ) {
        this.apiUrl = ENV.apiUrl;
    }

    ngOnInit() {
        this.getEntities();

        this.entityService.entities$
            .pipe(
                filter((entities) => entities.length > 0)
            )
            .subscribe((entities) => {
                this.entities = entities;
            });
    }

    add(entity: Entity) {
        this.entityService.add(entity);
    }

    delete(entity: Entity) {
        this.entityService.delete(entity.id);
    }

    getEntities() {
        this.entityService.getAll();
    }

    reload() {
        this.getEntities();
    }

    viewEntityContent(id: string) {
        this.appRoutingService.routeToEntity(id);
    }

    closeSidenav() {
        this.appRoutingService.routeBackFromSidenav();
        this.store.dispatch(setSidenavState({ isOpen: false }));
    }

    openSidenav() {
        this.store.dispatch(setSidenavState({ isOpen: true }));
    }
}
