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

export interface StorageEntry<T> {
    data: T;
    expires: number;
    version: string;
}

// Store items for two days before being eligible for removal.
const MILLIS_PER_DAY = 86400000;
const TWO_DAYS = MILLIS_PER_DAY * 2;

export abstract class StorageBaseService<T> {
    protected abstract readonly VERSION: string;
    protected abstract readonly KEY: string;
    protected abstract readonly STORAGE: Storage; // sessionStorage or this.STORAGE

    /**
     * Stores the specified item.
     *
     * @param {string} key
     * @param {object} data
     * @param {integer} expires
     */
    protected setEntry(data: T, expires?) {
        // calculate the expiration
        const ex = this.isDefinedAndNotNull(expires) ? expires : new Date().valueOf() + TWO_DAYS;

        // create the entry
        const entry: StorageEntry<T> = {
            version: this.VERSION,
            expires: ex,
            data
        };

        // store the entry
        try {
            this.STORAGE.setItem(this.KEY, JSON.stringify(entry));
        } catch (e) { } // eslint-disable-line no-empty
    }

    /**
     * Returns whether there is an entry for this key. This will not check the expiration. If
     * the entry is expired, it will return null on a subsequent getItem invocation.
     *
     * @param {string} key
     * @returns {boolean}
     */
    protected hasEntry(key) {
        return this.getEntry(key) !== null;
    }

    /**
     * Gets the entry with the specified key. If an entry with this key does
     * not exist, null is returned. If an entry exists but cannot be parsed
     * or is malformed/unrecognized, null is returned.
     *
     * @param {string} key
     */
    protected getEntry(checkExpired: boolean = false) {
        try {
            // parse the entry
            const entry = JSON.parse(this.STORAGE.getItem(this.KEY));

            // ensure the entry and item are present
            if (entry) {
                if (entry === null) {
                    return null;
                }

                if (checkExpired) {
                    // if the entry is expired, drop it and return null
                    if (this.checkEntryExpiration(entry)) {
                        this.removeEntry(this.KEY);
                        return null;
                    }
                    return null;
                }

                // if the entry has the specified field return its value
                if (this.isDefinedAndNotNull(entry?.data)) {
                    return entry.data;
                }

                return null;
            }

            return null;
        } catch (e) {
            return null;
        }
    }

    /**
     * Gets the expiration for the specified entry. This will not check the expiration. If
     * the entry is expired, it will return null on a subsequent getItem invocation.
     *
     * @param {string} key
     * @returns {integer}
     */
    protected getEntryExpiration(key) {
        const entry = this.getEntry(key);
        if (entry === null) {
            return null;
        }

        // if the entry has the specified field return its value
        if (this.isDefinedAndNotNull(entry?.expires)) {
            return entry.expires;
        }

        return null;
    }

    /**
     * Removes the entry with the specified key.
     *
     * @param {type} key
     */
    protected removeEntry(key) {
        this.STORAGE.removeItem(key);
    }

    /**
     * Checks the expiration for the specified entry.
     *
     * @param {object} entry
     * @returns {boolean}
     */
    protected checkEntryExpiration(entry) {
        if (this.isDefinedAndNotNull(entry?.expires)) {
            // get the expiration
            const expires = new Date(entry.expires);
            const now = new Date();

            // return whether the expiration date has passed
            return expires.valueOf() < now.valueOf();
        }

        return false;
    }

    private isDefinedAndNotNull = function (obj) {
        return !(typeof obj === 'undefined') && !(obj === null);
    };
}
