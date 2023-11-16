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

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';
import { fullyConfigureTestingModule } from '../../../testing/configureTestingModule';
import { SidenavContentComponent } from './sidenav-content.component';
import { SidenavContentModule } from './sidenav-content.module';

describe('Sidenav Content Component', () => {
    let component: SidenavContentComponent;
    let fixture: ComponentFixture<SidenavContentComponent>;

    beforeEach(waitForAsync(() => {
        fullyConfigureTestingModule({
            imports: [
                SidenavContentModule
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SidenavContentComponent);
        component = fixture.componentInstance;
        spyOn(component['entityService'], 'getByKey').and.callFake(() => of({
            id: '789',
            name: 'Entity 789'
        }));
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
