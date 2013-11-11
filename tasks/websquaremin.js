/*
 * grunt-contrib-websquaremin
 * https://github.com/inswave/grunt-contrib-websquaremin
 *
 * Copyright (c) 2013 inswave
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
    'use strict';

    var pd          = require('pretty-data').pd,
        helper      = require('grunt-lib-contrib').init(grunt),
        uglify      = require('uglify-js'),
        _s          = require('underscore.string'),
        path        = require('path'),
        CleanCSS    = require('clean-css');

    grunt.registerMultiTask('websquaremin', 'Minify WebSquare XML', function() {
        var options = this.options({
			    preserveComments: false
		    }),
            dest,
            isExpandedPair,
            fileType,
            tally = {
                dirs: 0,
                xml: 0,
                js: 0,
                css: 0,
                png: 0,
                jpg: 0
            },
            scriptRegex = /(<script[\s\S]*?type=[\"\']javascript[\"\'][\s\S]*?><!\[CDATA\[)([\s\S]*?)(\]\]><\/script>)/ig,
            min = '',
            max = '',
            detectDestType = function( dest ) {
                if( _s.endsWith( dest, '/' ) ) {
                    return 'directory';
                } else {
                    return 'file';
                }
            },
            detectFileType = function( src ) {
                if( _s.endsWith( src, '.xml' ) ) {
                    return 'XML';
                } else if( _s.endsWith( src, '.js' ) ) {
                    return 'JS';
                } else if( _s.endsWith( src, '.css' ) ) {
                    return 'CSS';
                } else if( _s.endsWith( src, '.png' ) ) {
                    return 'PNG';
                } else if( _s.endsWith( src, '.jpg' ) ) {
                    return 'JPG';
                } else {
                    return '';
                }
            },
            countWithFileType = function( fileType ) {
                if( fileType === 'XML' ) {
                    tally.xml++;
                } else if( fileType === 'JS' ) {
                    tally.js++;
                } else if( fileType === 'CSS' ) {
                    tally.css++;
                } else if( fileType === 'PNG' ) {
                    tally.png++;
                } else if( fileType === 'JPG' ) {
                    tally.jpg++;
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
                    fileType = detectFileType( src );
                    grunt.verbose.writeln( fileType + ' Minifing ' + src.cyan + ' -> ' + dest.cyan);

                    debugger;

                    max = grunt.file.read( src ) + grunt.util.normalizelf( grunt.util.linefeed );

                    try {
                        if( fileType === 'XML' ) {
                            max = max.replace( scriptRegex, function( all, g1, g2, g3 ) {
                                return g1 + uglify.parse( g2, {} ).print_to_string() + g3;
                            });

                            min = pd.xmlmin( max, options.preserveComments );
                        } if( fileType === 'JS' ) {
                            min = uglify.parse( max, {} ).print_to_string();    // option 처리
                        } if( fileType === 'CSS' ) {
                            min = new CleanCSS( {} ).minify( max );             // option 처리
                        }
                    } catch( err ) {
                        grunt.warn( src + '\n' + err );
                    }

                    if( min.length < 1 ) {
                        grunt.log.warn( 'Destination not written because minified ' + src.cyan + ' was empty.' );
                    } else {
                        grunt.file.write( dest, min );
                        grunt.verbose.writeln( fileType + ' minified ' + src.cyan + ' -> ' + dest.cyan );
                        helper.minMaxInfo( min, max );
//                        tally.xml++;
                        countWithFileType( fileType );
                    }
                }
            });
        });

        if( tally.dirs ) {
            grunt.log.write( 'Created ' + tally.dirs.toString().cyan + ' directories' );
        }

        if( tally.xml ) {
            grunt.log.write( ( tally.xml ? ', minified ' : 'Minified ' ) + tally.xml.toString().cyan + ' xml' );
        }

        if( tally.js ) {
            grunt.log.write( ( tally.js ? ', minified ' : 'Minified ' ) + tally.js.toString().cyan + ' js' );
        }

        if( tally.css ) {
            grunt.log.write( ( tally.css ? ', minified ' : 'Minified ' ) + tally.css.toString().cyan + ' css' );
        }

        grunt.log.writeln();
    });
};
