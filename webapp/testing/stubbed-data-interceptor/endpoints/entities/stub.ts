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

// import { environment as ENV } from 'webapp/environments/environment';
import { StubbedDataRouter } from 'webapp/platform/services/stub-data-interceptor.service';
import { entities } from './data';
// import { finalize, interval, map, Observable, Subject } from 'rxjs';
// import { delay } from 'rxjs/operators';

export default (stubbedDataRouter: StubbedDataRouter) => {
    stubbedDataRouter.registerRoute('GET', 'entities', () => entities);

    stubbedDataRouter.registerEntityRoute('entity/:id', entities);

    // Or you can use a custom handler
    // stubbedDataRouter.registerRoute('GET', 'entity/:id', (params) => {
    //     console.log(entities.filter((d) => d.id === (params as any).id));
    //     return entities.filter((d) => d.id === (params as any).id)[0];

    // Or you can serve static resources for constant paths
    // stubbedDataRouter.registerStaticRoute('entity/123', entities[0]);
    // });

    // STOMP topic examples
    // stubbedDataRouter.registerEventStreamRoute('entities', () => interval(1000).pipe(
    //     map((): { entities: Entity[], timestamp: number } => ({
    //         entities,
    //         timestamp: Date.now()
    //     }))
    // ));
    //
    // let changeTopicSubject: Subject<any> = null;
    // stubbedDataRouter.registerEventStreamRoute('entity/:id/change', (): Observable<any> => {
    //     if (changeTopicSubject) {
    //         changeTopicSubject.complete();
    //     }
    //     changeTopicSubject = new Subject<any>();
    //     return changeTopicSubject.pipe(
    //         delay(ENV.delayForSTOMPTopics),
    //         finalize(() => { changeTopicSubject = null; })
    //     );
    // });
};
