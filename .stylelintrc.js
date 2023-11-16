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

module.exports = {
    "extends": "stylelint-config-standard-scss",
    "rules": {
        "indentation": null,
        "at-rule-no-unknown": [true, {
            "ignoreAtRules": ["for", "each", "extend", "/include/", "/mixin/", "/function/", "/return/"]
        }],
        "declaration-empty-line-before": null,
        "selector-type-no-unknown": [true, {
            "ignoreTypes": ["/mat-/", "/ngx-/"]
        }],
        "font-family-no-missing-generic-family-keyword": null,
        "no-empty-source": null,
        "selector-pseudo-element-no-unknown": [true, {
            "ignorePseudoElements": ["ng-deep"]
        }],
        "scss/at-extend-no-missing-placeholder": null,
        "scss/dollar-variable-pattern": null,
        "scss/no-global-function-names": null,
        "color-function-notation": "legacy",
        "alpha-value-notation": "number"
    },
    "ignoreFiles": [
        "webapp/platform/assets/**/*.scss",
        "webapp/platform/ngx-design-system-seed/assets/styles/material/**"
    ]
};
