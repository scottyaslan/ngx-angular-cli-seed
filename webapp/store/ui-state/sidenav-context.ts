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

import { Action, createAction, createReducer, on, props } from '@ngrx/store';
import { UiState } from '../app-store.module';

export interface SidenavState {
    isOpen: boolean;
}

const initialState: SidenavState = {
    isOpen: false
};

// Actions
export const setSidenavState = createAction(
    '[Sidenav] setSidenavState',
    props<{ isOpen: boolean }>()
);

// Reducers
const reducer = createReducer(
    initialState,
    on(setSidenavState, (state, { isOpen }) => ({
        ...state,
        isOpen
    }))
);

export function sidenavStateReducer(state: SidenavState, action: Action) {
    return reducer(state, action);
}

// Selectors
export const selectSidenavIsOpen = (state: UiState) => state.sidenavState.isOpen;
