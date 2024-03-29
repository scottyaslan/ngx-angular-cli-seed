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

describe('App component', () => {
    it('should override stubbed data prior to page load and then again on subsequent request', () => {
        cy.prePageLoadStubbedExtraResponse('GET', 'entity/123', { id: '456', name: 'Entity 456' });

        cy.visit('/');
        cy.getByDataIt('entity-table').should('exist');

        cy.visit('/sidenav-example/entities/123');
        cy.getByDataIt('entity-name').should('contain', 'Entity 456');

        cy.nextRequestStubbedExtraResponse('GET', 'entity/123', { id: '789', name: 'Entity 789' });

        cy.getByDataIt('btn-reload-entity').click();

        cy.getByDataIt('entity-name').should('contain', 'Entity 789');

        cy.getByDataIt('btn-reload-entity').click();

        cy.getByDataIt('entity-name').should('contain', 'Entity 123');
    });
});
