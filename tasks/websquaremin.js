/*
 * grunt-contrib-websquaremin
 * https://github.com/inswave/grunt-contrib-websquaremin
 *
 * Copyright (c) 2013 inswave
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
    'use strict';

    var pd = require('pretty-data').pd,
        helper = require('grunt-lib-contrib').init(grunt),
        uglify = require('uglify-js'),
        _s = require('underscore.string'),
        path = require('path');

    grunt.registerMultiTask('websquaremin', 'Minify WebSquare XML', function() {
        var options = this.options({
			    preserveComments: false
		    }),
            dest,
            isExpandedPair,
            tally = {
                dirs: 0,
                xml: 0
            },
            scriptRegex = /(<script[\s\S]*?type=[\"\']javascript[\"\'][\s\S]*?><!\[CDATA\[)([\s\S]*?)(\]\]><\/script>)/ig,
            min,
            max,
            detectDestType = function( dest ) {
                if( _s.endsWith( dest, '/' ) ) {
                    return 'directory';
                } else {
                    return 'file';
                }
            },
            unixifyPath = function( filepath ) {
                if( process.platform === 'win32' ) {
                    return filepath.replace( /\\/g, '/' );
                } else {
                    return filepath;
                }
            };

        grunt.verbose.writeflags( options, 'Options' );

        this.files.forEach( function( filePair ) {
            isExpandedPair = filePair.orig.expand || false;

            filePair.src.forEach( function( src ) {
                if( detectDestType( filePair.dest ) === 'directory' ) {
                    dest = (isExpandedPair) ? filePair.dest : unixifyPath( path.join( filePair.dest, src ) );
                } else {
                    dest = filePair.dest;
                }

                if( grunt.file.isDir( src ) ) {
                    grunt.verbose.writeln( 'Creating ' + dest.cyan );
                    grunt.file.mkdir( dest );
                    tally.dirs++;
                } else {
                    grunt.verbose.writeln('Minifing ' + src.cyan + ' -> ' + dest.cyan);
                    debugger;
                    max = grunt.file.read( src ) + grunt.util.normalizelf( grunt.util.linefeed );

                    try {
                        max = max.replace( scriptRegex, function( all, g1, g2, g3 ) {
                            return g1 + uglify.parse( g2, {} ).print_to_string() + g3;
                        });
                    } catch( err ) {
                        grunt.warn( src + '\n' + err );
                    }

                    try {
                        min = pd.xmlmin( max, options.preserveComments );
                    } catch( err ) {
                        grunt.warn( src + '\n' + err );
                    }

                    if( min.length < 1 ) {
                        grunt.log.warn( 'Destination not written because minified XML was empty.' );
                    } else {
                        grunt.file.write( dest, min );
                        grunt.verbose.writeln( 'Minifing ' + src.cyan + ' -> ' + dest.cyan );
                        helper.minMaxInfo( min, max );
                        tally.xml++;
                    }
                }
            });
        });

        if( tally.dirs ) {
            grunt.log.write( 'Created ' + tally.dirs.toString().cyan + ' directories' );
        }

        if( tally.xml ) {
            grunt.log.write( ( tally.xml ? ', minified ' : 'Minified ' ) + tally.xml.toString().cyan + ' xmls' );
        }

        grunt.log.writeln();
    });
};
