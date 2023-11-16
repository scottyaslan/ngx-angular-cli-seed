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
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { EntityService } from '../../../store/resources/entities/entity.service';

@Component({
    templateUrl: './sidenav-content.component.html',
    styleUrls: ['./sidenav-content.component.scss']
})
export class SidenavContentComponent implements OnInit {
    protected apiUrl: string;
    protected entity: any;
    protected loading$ = this.entityService.loading$;

    constructor(
        private activatedRoute: ActivatedRoute,
        protected entityService: EntityService
    ) {
        this.apiUrl = ENV.apiUrl;
    }

    ngOnInit() {
        this.reload();
    }

    reload() {
        this.entityService.getByKey(this.activatedRoute.snapshot.params.entityId)
            .pipe(
                take(1)
            )
            .subscribe({
                next: (entity) => {
                    this.entity = entity;
                },
                error: (error) => JSON.parse(JSON.stringify(error))
            });
    }
}
