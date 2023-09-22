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

// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

/**
 * Environment with mock interceptor enabled on all routes
 * for manual testing and development
 */

import { environment } from './environment.prod';

environment.production = false;
environment.development = true;

environment.stubbedDataInterceptor.logging = true;
environment.stubbedDataInterceptor.enabled = true; // all mocks are enabled
environment.stubbedDataInterceptor.delay = 500; // simulating 0.5s api response time
environment.statefulMockHandlers = true; // mock handlers are allowed to mutate mock data

environment.kitchenSinkPageVisible = true;

// uncomment temporarily if you need it for testing
// environment.polling.interval = 5 * 1000;
// environment.polling.notificationsPollingInterval = 5 * 1000;

environment.apiPath = `${environment.apiUrl}`;

export { environment };

// use this variable to drive handshaking while building application bundles, see environment.prod.ts for details
export const IS_PRODUCTION_BUILD = false;
