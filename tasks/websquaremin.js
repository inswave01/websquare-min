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
        uglify = require('uglify-js');

    grunt.registerMultiTask('websquaremin', 'Minify WebSquare XML', function() {
        var options = this.options({
			preserveComments: false
		});

        this.files.forEach(function (file) {
            var scriptRegex = /(<script[\s\S]*?type=[\"\']javascript[\"\'][\s\S]*?><!\[CDATA\[)([\s\S]*?)(\]\]><\/script>)/ig,
                tempArray = [],
                min,
                max = file.src.filter(function(filepath) {
                    // Warn on and remove invalid source files (if nonull was set).
                    if (!grunt.file.exists(filepath)) {
                        grunt.log.warn('Source file "' + filepath + '" not found.');
                        return false;
                    }

                    return true;
                })
                    .map(grunt.file.read)
                    .join(grunt.util.normalizelf(grunt.util.linefeed));

            try {
                while( ( tempArray = scriptRegex.exec(max) ) ) {
                    grunt.log.writeln('tempArray[2]\n' + tempArray[2]);
//                    scriptBody.push.apply( scriptBody, tempArray );
                }

                max = max.replace( scriptRegex, function( all, g1, g2, g3 ) {
                    return g1 + uglify.parse( g2, {} ).print_to_string() + g3;
                });
                grunt.log.writeln('max\n' + max);
            } catch (err) {
                grunt.warn(file.src + '\n' + err);
            }

            try {
                min = pd.xmlmin(max, options.preserveComments);
            } catch (err) {
                grunt.warn(file.src + '\n' + err);
            }

            if (min.length < 1) {
                grunt.log.warn('Destination not written because minified XML was empty.');
            } else {
                grunt.file.write(file.dest, min);
                grunt.log.writeln('File "' + file.dest + '" created.');
                helper.minMaxInfo(min, max);
            }
        });
    });
};
