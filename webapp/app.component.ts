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

import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'webapp',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    sidenavOpen = false;
    protected basePath = 'http://localhost:1337';

    constructor(protected httpClient: HttpClient) {
    }

    ngOnInit() {
        this.httpClient.get(`${this.basePath}/entity/1234`).subscribe((data) => {
            // eslint-disable-next-line no-console
            console.log(`Stubbed data: ${data}`);
        });
    }

    closeSidenav() {
        this.sidenavOpen = false;
    }
}
