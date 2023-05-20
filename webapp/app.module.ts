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

import { BrowserModule } from '@angular/platform-browser';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PlatformModule } from 'webapp/platform/platform.module';
import { AppRoutingModule } from './app.routes.module';
import { AppComponent } from './app.component';
import { KitchenSinkModule } from './components/kitchen-sink/kitchen-sink.module';

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        FlexLayoutModule,
        MatIconModule,
        MatSidenavModule,
        MatButtonModule,
        MatToolbarModule,
        BrowserModule,
        AppRoutingModule,
        KitchenSinkModule,
        BrowserAnimationsModule,
        PlatformModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
