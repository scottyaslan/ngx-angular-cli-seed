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

export interface StubbedDataInterceptorConfiguration {
    apiUrl: string | string[]; // e.g.:`http://localhost:4200/api/v1`;
    // enable stubbed single endpoints using an array: enabled = [...]
    // enabled === true enables all stubbed endpoints
    // enabled === false disables all stubbed endpoints
    // (note that changing this while running by window.environment has no effect)
    enabled: string[] | boolean;
    logging: boolean;
    delay: number; // simulates slow network
    // if true, stubbed interceptor will be available as window.stubbedDataInterceptor used by Cypress e2e tests
    exposeToWindow: boolean;
    // Request History tracks all http requests processed by Stubbed Data Interceptor
    // should be enabled while e2e or unit testing
    enableRequestHistory: boolean;
}
// use this variable to drive handshaking while building application bundles
// to exclude code from production build, use: if(!IS_PRODUCTION_BUILD) { codeForDevOnly }
// (members of 'environment' are not considered as constant,
// they won't exclude code from the production build)

export const IS_PRODUCTION_BUILD = true;

const root = location ? location.origin : '';
const rootApiPath = '';

const stubbedDataInterceptor: StubbedDataInterceptorConfiguration = {
    apiUrl: [
        `${root}${rootApiPath}`
    ],
    enabled: false,
    logging: false,
    delay: 1000,
    exposeToWindow: false,
    enableRequestHistory: false
};

export const environment = {
    production: true,
    development: false,
    apiUrl: `${root}${rootApiPath}`,
    apiPath: rootApiPath,
    inputFieldDebounceTime: 500,
    features: {
        // enable/disable features here
    },

    kitchenSinkPageVisible: false, // a showroom for implemented components that are not used in the current release

    stubbedDataInterceptor,
    delayToCheckProgress: stubbedDataInterceptor.delay, // special delay for requests that should last longer to be able to check progress
    delayForSTOMPTopics: stubbedDataInterceptor.delay, // special delay for STOMP over websocket

    // we can implement mock handlers 2 ways:
    // - stateless (for testing)
    // - stateful (for manual testing and developing)
    // handlers can decide based on this setting whether or not mutate mock data
    statefulMockHandlers: false,

    polling: {
        interval: 30 * 1000, // ms, the default polling interval
    },

    routing: {
        debug: false,
        // logging error to console, because this swallows all routing errors during development
        // eg. DI error, missing module import, etc.
        logErrors: true
    }
};
