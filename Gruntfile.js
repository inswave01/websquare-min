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
            tests: ['tmp'],
            traverse: ['dest']
        },
        copy: {
            main: {
                files: [
                    {expand: true, src: ['src/**'], dest: 'dest/'}
                ]
            },
            cwd: {
                files: [
                    {expand: true, cwd: 'src/', src: ['**'], dest: 'dest/'}
                ]
            }
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
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('test', ['clean:tests', 'websquaremin:compile']);
    grunt.registerTask('traverse', ['clean:traverse', 'copy:cwd']);
    grunt.registerTask('default', ['test']);
};
