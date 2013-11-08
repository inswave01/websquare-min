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
            var scriptRegex = /(<script type=[\"\']javascript[\"\']><!\[CDATA\[)([\s\S]*?)(\]\]><\/script>)/i,
                scriptBody,
                result,
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
                scriptBody = scriptRegex.exec(max);
                result = uglify.parse(scriptBody[2], {});
                max = max.replace(scriptRegex, "$1" + result.print_to_string() + "$3");
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
