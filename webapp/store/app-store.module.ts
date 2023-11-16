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
import { HttpClientModule } from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { DefaultDataServiceConfig, EntityDataModule } from '@ngrx/data';
import { entityConfig } from './entity-metadata';
import { SidenavState, sidenavStateReducer } from './ui-state/sidenav-context';
import { AppSidenavState, appSidenavStateReducer } from './ui-state/app-sidenav-context';

const defaultDataServiceConfig: DefaultDataServiceConfig = {
    root: `${ENV.apiUrl}`,
    timeout: 3000, // request timeout
};

export const uiState = {
    appSidenavState: appSidenavStateReducer,
    sidenavState: sidenavStateReducer
};

export interface UiState {
    appSidenavState: AppSidenavState
    sidenavState: SidenavState
}

@NgModule({
    imports: [
        HttpClientModule,
        StoreModule.forRoot(uiState, {
            runtimeChecks: {
                strictStateImmutability: true,
                strictActionImmutability: true,
                strictStateSerializability: true,
                strictActionSerializability: true,
            }
        }),
        EffectsModule.forRoot([]),
        EntityDataModule.forRoot(entityConfig)
    ],
    providers: [{ provide: DefaultDataServiceConfig, useValue: defaultDataServiceConfig }]
})
export class AppStoreModule { }
