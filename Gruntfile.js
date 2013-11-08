/*
 * grunt-contrib-websquaremin
 * https://github.com/inswave/grunt-contrib-websquaremin
 *
 * Copyright (c) 2013 inswave
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
    'use strict';

    grunt.initConfig({
        clean: {
            tests: ['tmp']
        },
        websquaremin: {
            compile: {
                files: {
                    'tmp/treeview_basic_1.xml': ['test/treeview_basic_1.xml']
                }
            }
        }
    });

    grunt.loadTasks('tasks');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('test', ['clean', 'websquaremin']);
    grunt.registerTask('default', ['test']);
};
