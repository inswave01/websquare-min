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
            tests: ['tmp/*'],
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
                options: {
                    js: {
                        compress: {
                            booleans : true
                        },
                        mangle: {
                            booleans : false,
                            except: ['jQuery']
                        }
                    },
                    css: {

                    }
                },
                files: {
                    'tmp/treeview_basic_1.xml': ['test/treeview_basic_1.xml']
                }
            },
            traverse: {
                options: {
                    js: {
                        compress: {
                            booleans : true
                        },
                        mangle: {
                            booleans : false,
                            except: ['jQuery']
                        }
                    },
                    css: {

                    }
                },
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
            },
            traverse_encoding: {
                options: {
                    encoding: 'EUC-KR'
                },
                files: [
                    {expand: true, cwd: 'src/', src: ['**'], dest: 'dest/'}
                ]
            }
        },
        concat: {
          options: {
            separator: ';',
          },
          dist: {
            src: ['dest/lib/ngmf.js', 'dest/lib/pubComm.js', 'dest/lib/ZAPP_Calendar.js', 'dest/lib/**'],
            dest: 'dest/lib/ngmf.all.min.js',
          }
        }
    });

    grunt.loadTasks('tasks');

    grunt.registerTask('test', ['clean:tests', 'websquaremin:compile']);
    grunt.registerTask('traverse', ['clean:traverse', 'websquaremin:traverse']);
    grunt.registerTask('uglify', ['clean:traverse', 'websquaremin:traverse', 'concat:dist']);
    grunt.registerTask('traverse_filter01', ['clean:traverse', 'websquaremin:traverse_reg']);
    grunt.registerTask('traverse_filter02', ['clean:traverse', 'websquaremin:traverse_func']);
    grunt.registerTask('traverse_option', ['clean:traverse', 'websquaremin:traverse_option']);
    grunt.registerTask('traverse_encoding', ['clean:traverse', 'websquaremin:traverse_encoding']);
    grunt.registerTask('default', ['test']);
};
