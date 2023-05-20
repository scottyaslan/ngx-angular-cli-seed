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

// eslint-disable-next-line no-bitwise
export const randomId = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);

// Deep equality with some nested properties excluded
//
// // will match any 'Bear' with xxl size
// deepEqualsWithExclusions(apiResponse, {
//    id: EXCLUDE_FROM_DEEP_EQUALS,
//    name: 'Bear',
//    props: {
//        size: 'xxl',
//        hash: EXCLUDE_FROM_DEEP_EQUALS
//    }
// })

export const EXCLUDE_FROM_DEEP_EQUALS = 'EXCLUDE_FROM_DEEP_EQUALS';
export function deepEqualsWithExclusions(obj1: any, obj2: any): boolean {
    return compare(obj1, obj2) && compare(obj2, obj1);
}

function compare(source: any, dest: any): boolean {
    if (dest === undefined) {
        return false;
    }
    if (Array.isArray(source)) {
        return source.every((_, i) => deepEqualsWithExclusions(source[i], dest[i]));
    }
    if ((typeof source === 'object') && (source !== null)) {
        return Object.keys(source).every((key) => deepEqualsWithExclusions(source[key], dest[key]));
    }
    if (source === EXCLUDE_FROM_DEEP_EQUALS || dest === EXCLUDE_FROM_DEEP_EQUALS) {
        return true;
    }
    return source === dest;
}
