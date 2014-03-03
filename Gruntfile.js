/*
 * websquare-min
 * https://github.com/inswave/websquare-min
 *
 * Copyright (c) 2013 inswave
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
    'use strict';

    require('load-grunt-tasks')(grunt);

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
            },
            traverse: {
                files: [
                    {expand: true, cwd: 'src/', src: ['**'], dest: 'dest/'}
                ]
            },
            traverse_reg: {
                options: {
                    filter: /\S*subdir\S*/
                },
                files: [
                    {expand: true, cwd: 'src/', src: ['**'], dest: 'dest/'}
                ]
            },
            traverse_func: {
                options: {
                    filter: function ( source ) {
//                                if ( source.indexOf('.xml') > 0 ) {
//                                    return false;
//                                } else {
//                                    return true;
//                                }
                                return source.indexOf('.xml') <= 0;
                            }
                },
                files: [
                    {expand: true, cwd: 'src/', src: ['**'], dest: 'dest/'}
                ]
            },
            traverse_option: {
                options: {
                    js: {
                        compress: {
                            booleans: false
                        },
                        mangle: {
                            except: ['returnValue']
                        }
                    },
                    css: {

                    }
                },
                files: [
                    {expand: true, cwd: 'src/', src: ['**'], dest: 'dest/'}
                ]
            }
        }
    });

    grunt.loadTasks('tasks');

    grunt.registerTask('test', ['clean:tests', 'websquaremin:compile']);
    grunt.registerTask('traverse', ['clean:traverse', 'websquaremin:traverse']);
    grunt.registerTask('traverse_filter01', ['clean:traverse', 'websquaremin:traverse_reg']);
    grunt.registerTask('traverse_filter02', ['clean:traverse', 'websquaremin:traverse_func']);
    grunt.registerTask('traverse_option', ['clean:traverse', 'websquaremin:traverse_option']);
    grunt.registerTask('default', ['test']);
};
