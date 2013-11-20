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
//            xmlOptions = options.xml || {},
            jsOptions  = options.js || {},
            cssOptions = options.css || {},
            ast,
            compressor,
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
            scriptRegex = /(<script[\s\S]*?type=[\"\']javascript[\"\'][\s\S]*?>[\s]*<!\[CDATA\[)([\s\S]*?)(\]\]>[\s]*<\/script>)/ig,
            styleRegex  = /(<style[\s\S]*?type=[\"\']text\/css[\"\'][\s\S]*?>[\s]*<!\[CDATA\[)([\s\S]*?)(\]\]>[\s]*<\/style>)/ig,
            exceptRegex = /return\s*/,
            eventRegex  = /ev\:event/,
            pseudoFunc  = ['(function(){', '})'],
            min = '',
            max = '',
            checkFilter = function ( source ) {
                if ( options.filter instanceof RegExp ) {
                    if ( options.filter.test( source ) ) {
                        return false;
                    }
                } else if ( typeof options.filter === 'function' ) {
                    return options.filter( source );
                }
                return true;
            },
            detectDestType = function ( dest ) {
                if( _s.endsWith( dest, '/' ) ) {
                    return 'directory';
                } else {
                    return 'file';
                }
            },
            detectFileType = function ( src ) {
                if( _s.endsWith( src, '.xml' ) ) {
                    return 'XML';
                } else if( _s.endsWith( src, '.js' ) ) {
                    return 'JS';
                } else if( _s.endsWith( src, '.css' ) ) {
                    return 'CSS';
                } else if( _s.endsWith( src, '.png' ) ) {
//                    return 'PNG';
                    return '';
                } else if( _s.endsWith( src, '.jpg' ) ) {
//                    return 'JPG';
                    return '';
                } else {
                    return '';
                }
            },
            countWithFileType = function ( fileType ) {
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
            unixifyPath = function ( filepath ) {
                if( process.platform === 'win32' ) {
                    return filepath.replace( /\\/g, '/' );
                } else {
                    return filepath;
                }
            },
            _minifyJS = function ( ast ) {
                if ( jsOptions.compress !== false ) {
                    debugger;
                    ast.figure_out_scope();

                    if ( jsOptions.compress.warnings !== true ) {
                        jsOptions.compress.warnings = false;
                    }
                    compressor = uglify.Compressor( jsOptions.compress );
                    ast = ast.transform( compressor );
                }

                if ( jsOptions.mangle !== false ) {
                    ast.figure_out_scope();
                    ast.compute_char_frequency();
                    ast.mangle_names( jsOptions.mangle );
                }
                return ast.print_to_string();
            },
            minifyJS = function ( source, options, startTag ) {
                if( startTag && eventRegex.test(startTag) && exceptRegex.test( source ) ) {
                    ast = uglify.parse( pseudoFunc[0] + source + pseudoFunc[1], options );
                    source = _minifyJS( ast );
                    source = source.substring( pseudoFunc[0].length, source.lastIndexOf(pseudoFunc[1]) );
                    return source;
                } else if( eventRegex.test(source) ) {
                    grunt.verbose.writeln( 'skip - ev:event is included in source.' );
                    return source;
                }

                ast =  uglify.parse( source, options );
                return _minifyJS( ast );
            },
            minifyCSS = function ( source, options ) {
                return new CleanCSS( options ).minify( source );
            },
            printSummary = function () {
                var isWrite = false;

                if( tally.dirs ) {
                    grunt.log.write( 'Created ' + tally.dirs.toString().cyan + ' directories' );
                    isWrite = true;
                }

                if( tally.xml ) {
                    grunt.log.write( ( isWrite ? ', minified ' : 'Minified ' ) + tally.xml.toString().cyan + ' xml' );
                    isWrite = true;
                }

                if( tally.js ) {
                    grunt.log.write( ( isWrite ? ', minified ' : 'Minified ' ) + tally.js.toString().cyan + ' js' );
                    isWrite = true;
                }

                if( tally.css ) {
                    grunt.log.write( ( isWrite ? ', minified ' : 'Minified ' ) + tally.css.toString().cyan + ' css' );
//                    isWrite = true;
                }

                grunt.log.writeln();
            };


        grunt.verbose.writeflags( options, 'Options' );

        this.files.forEach( function( filePair ) {
            isExpandedPair = filePair.orig.expand || false;

            filePair.src.forEach( function( src ) {

                if( checkFilter( src ) ) {
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

                        if( fileType ) {
                            grunt.verbose.writeln( fileType + ' Minifing ' + src.cyan + ' -> ' + dest.cyan );

                            max = grunt.file.read( src ) + grunt.util.normalizelf( grunt.util.linefeed );

                            try {
                                if( fileType === 'XML' ) {
                                    max = max.replace( scriptRegex, function( all, g1, g2, g3 ) {
                                        return g1 + minifyJS( g2, jsOptions, g1 ) + g3;
                                    });

                                    max = max.replace( styleRegex, function( all, g1, g2, g3 ) {
                                        return g1 + minifyCSS( g2, cssOptions ) + g3;

                                    });

                                    min = pd.xmlmin( max, options.preserveComments );
                                } if( fileType === 'JS' ) {
                                    min = minifyJS( max, jsOptions );                          // option 처리
                                } if( fileType === 'CSS' ) {
                                    min = minifyCSS( max, cssOptions );                         // option 처리
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
                                countWithFileType( fileType );
                            }
                        } else {
                            grunt.verbose.writeln( src.cyan + ' is skiped' );
                        }
                    }
                } else {
                    grunt.verbose.writeln( filePair.src[0] + ' is filtered.' );
                }
            });
        });

        printSummary();
    });
};
