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

import { environment } from './environment.prod';

environment.production = false;
environment.stubbedDataInterceptor.logging = true;
environment.stubbedDataInterceptor.enabled = true;
environment.stubbedDataInterceptor.delay = 10;
environment.delayToCheckProgress = 500;
environment.stubbedDataInterceptor.exposeToWindow = true;
environment.stubbedDataInterceptor.enableRequestHistory = true;
environment.statefulStubbedDataHandlers = true;

environment.apiPath = `${environment.apiUrl}`;

export { environment };

export const IS_PRODUCTION = false;
