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

// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config, debug = false) {
    config.set({
        basePath: '',
        frameworks: ['jasmine', '@angular-devkit/build-angular'],
        plugins: [
            require('karma-jasmine'),
            require('karma-chrome-launcher'),
            require('karma-jasmine-html-reporter'),
            require('karma-coverage'),
            require('@angular-devkit/build-angular/plugins/karma'),
            require('karma-spec-reporter')
        ],
        client: {
            clearContext: false // leave Jasmine Spec Runner output visible in browser
        },
        coverageReporter: {
            dir: require('path').join(__dirname, './coverage'),
            reporters: [
                // { type: 'html', subdir: '.' }, // uncomment if needed for any tool or manual check
                { type: 'lcov', subdir: '.' },
                { type: 'json', subdir: '.', file: 'coverage-final.json' },
                { type: 'text-summary' }
            ],
            fixWebpackSourcePaths: true
        },
        reporters: ['spec', 'kjhtml', 'coverage'],
        specReporter: {
            failFast: false,
            suppressSkipped: true,
            showSpecTiming: true
        },
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: debug ? ['Chrome'] : ['ChromeHeadless'],
        singleRun: true,
        restartOnFileChange: true,
        files: [
            { pattern: 'webapp/platform/assets/**/*.svg', watched: false, included: false, served: true },
        ],
        proxies: {}
    });
};
