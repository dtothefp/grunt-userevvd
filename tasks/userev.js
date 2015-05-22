/*
 * grunt-userev
 * https://github.com/kylerush/grunt-userev
 *
 * Copyright (c) 2014 Kyle Rush
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('userevvd', 'Replaces references in HTML to JavaScript and CSS files with their revv\'d version.', function() {

    grunt.userevvd = grunt.userevvd || {summary: {}};

    var target,
        options

    target = this.target;

    options = this.options();

    // Iterate over all specified file groups.
    this.files.forEach(function(f) {

      var src = f.src.filter(function(filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      });

      if(target === 'html'){

        src.forEach(function(file){

          //file is string to filepath

          var modifiedSrc,
              cheerio,
              $,
              tagToFind,
              newPath,
              newSrcValue,
              newElem;

          modifiedSrc = grunt.file.read(file);

          cheerio = require('cheerio');

          $ = cheerio.load(modifiedSrc);

          for(var propertyName in grunt.filerev.summary){

            if(typeof options.formatOriginalPath === 'function'){
              newPath = options.formatOriginalPath(propertyName);
            } else {
              newPath = propertyName;
            }

            if(typeof options.formatNewPath === 'function'){
              newSrcValue = options.formatNewPath(grunt.filerev.summary[propertyName]);
            } else {
              newSrcValue = grunt.filerev.summary[propertyName];
            }

            //populate summary object
            grunt.userevvd.summary[propertyName] = newSrcValue;

            if(
              /\.js/.test(propertyName) ||
              /\.png/.test(propertyName) ||
              /\.jpg/.test(propertyName) ||
              /\.jpeg/.test(propertyName) ||
              /\.gif/.test(propertyName) ||
              /\.svg/.test(propertyName)
            ){
              tagToFind = '[src="' + newPath + '"]';
              newElem = $(tagToFind).attr('src', newSrcValue);
              $(tagToFind).replaceWith( newElem );
            } else if(
              /\.css/.test(propertyName) ||
              /\.ico/.test(propertyName)
            ){
              tagToFind = 'link[href="' + newPath + '"]'
              newElem = $(tagToFind).attr('href', newSrcValue);
              $(tagToFind).replaceWith( newElem );
            }

          }//end for

          // Write the destination file.
          grunt.file.write(f.dest, $.html());
          //console.log($.html());

          // Print a success message.
          grunt.log.writeln('Replaced revv\'d assets in ' + f.dest);

        }); //end src for each loop

      } //end HTML TARGET

      else if(target === 'css') {
        src.forEach(function(file){

          //file is string to filepath

          var modifiedSrc,
              tagToFind,
              newPath,
              newSrcValue,
              newElem;

          modifiedSrc = grunt.file.read(file);

          for(var propertyName in grunt.filerev.summary){

            if(typeof options.formatOriginalPath === 'function'){
              newPath = options.formatOriginalPath(propertyName);
            } else {
              newPath = propertyName;
            }

            if(typeof options.formatNewPath === 'function'){
              newSrcValue = options.formatNewPath(grunt.filerev.summary[propertyName]);
            } else {
              newSrcValue = grunt.filerev.summary[propertyName];
            }

            //populate summary object
            grunt.userevvd.summary[propertyName] = newSrcValue;

            if(
              /\.js/.test(propertyName) ||
              /\.png/.test(propertyName) ||
              /\.jpg/.test(propertyName) ||
              /\.jpeg/.test(propertyName) ||
              /\.gif/.test(propertyName) ||
              /\.svg/.test(propertyName)
            ){
              var re = new RegExp(newPath, 'g');
              modifiedSrc = modifiedSrc.replace(re, newSrcValue);
            }
          }//end for

          // Write the destination file.
          grunt.file.write(f.dest, modifiedSrc);
          //console.log($.html());

          // Print a success message.
          grunt.log.writeln('Replaced revv\'d assets in ' + f.dest);

        });
      } // end CSS TARGET
      else {

        grunt.log.writeln('Target must be named "html". Currently only .html files are supported. In the future, .css will be supported.');

      }

    }); //end files for each loop

  });

};
