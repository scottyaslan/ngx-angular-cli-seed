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

const commonConfig = require('./karma.conf');

module.exports = function (config, executors = 4, debug = false) {
    commonConfig(config, debug);

    // restore karma parallel config
    config.frameworks = ['parallel'].concat(config.frameworks);
    config.plugins = [require('karma-parallel')].concat(config.plugins);
    config.parallelOptions = {
        // number of cores to shard spec files to when running tests, default to 1. Can override via CLI option `--parallelOptions.executors=4`
        executors: executors,
        shardStrategy: 'round-robin'

        // NOTE: defined reporters (spec, coverage-istanbul) can cause connection failures when running karma-parallel tests from IDE.
        // If this is the case, override this setting via the CLI option `--parallelOptions.aggregatedReporterTest=null` to disable aggregate reporting.
        // aggregatedReporterTest: null
    };
};
