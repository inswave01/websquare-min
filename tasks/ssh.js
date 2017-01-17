module.exports = function(grunt) {
  'use strict';

  const fs = require('fs'),
        tar = require('tar-fs'),
        zlib = require('zlib'),
        SSH = require('ssh2');

  grunt.registerMultiTask( 'pull', 'Pull remote directories', function() {
    let done = this.async(),
        options = this.options(),
        conn = new SSH();

    function transferDir( conn, options, cb ) {
      let cmd = 'tar cf - "' + options.remotePath + '" 2>/dev/null',
          compression = null;

      if ( options.compression ) {
        compression = options.compression;
      }

      if ( typeof compression === 'number' &&
          compression >= 1 &&
          compression <= 9 ) {
        cmd += ' | gzip -' + compression + 'c 2>/dev/null';
      }

      console.log('cmd ' + cmd);

      conn.exec( cmd, function ( err, stream ) {
        if ( err ) {
          return cb(err);
        }

        let exitErr,
            tarStream = tar.extract(options.localPath);

        tarStream.on('finish', function () {
          cb(exitErr);
        });

        stream.on( 'exit', function ( code, signal ) {
          if ( typeof code === 'number' && code != 0 ) {
            exitErr = new Error('Remote process exited with code ' + code );
          } else if ( signal ) {
            exitErr = new Error('Remote process killed signal ' + signal );
          }
        });

        if ( compression ) {
          stream = stream.pipe(zlib.createGunzip());
        }

        stream.pipe(tarStream);
      });
    }

    console.log( 'pull options : ' + JSON.stringify(options) );

    conn.on( 'ready', function () {
      transferDir( conn, options, function ( err ) {
        if (err) {
          console.log(err);
          conn.end();
          throw err;
        }
        console.log('Done pulling');
        conn.end();
        done();
      });
    }).connect(options);
  });

  grunt.registerMultiTask( 'push', 'Push local directory', function() {
    let done = this.async(),
        options = this.options(),
        conn = new SSH();

    function transferFile( conn, options, cb ) {
      conn.sftp( function( err, sftp ) {
        if (err) {
          throw err;
        }

        let exitErr,
            compression = null,
            tarStream,
            writeStream,
            fileName = options.fileName + '.tar';

        if ( options.compression ) {
          compression = options.compression;
          fileName += '.gz';
        }

        writeStream = sftp.createWriteStream( options.remotePath + '/' + fileName );

        writeStream.on( 'finish', function () {
          console.log( "file transferred successfully" );

          if ( options.unpack ) {
            let cmd = 'cd ' + options.remotePath + '\n';

            if ( compression ) {
              // gunzip 설치 여부에 따라 오동작 가능성이 있음으로 z 옵션 배제
              cmd += 'gzip -cd ' + fileName + ' | tar xvf -\n';
            } else {
              cmd += 'tar xvf ' + fileName + '\n';
            }

            if ( options.removeTarball ) {
              cmd += 'rm -f ' + fileName + '\n';
            }

            cmd += 'exit\n';

            console.log( 'cmd\n' + cmd );

            conn.shell( cmd, function( err, stream ) {
              if (err) {
                throw err;
              }

              stream.on( 'close', function( code, signal ) {
                console.log( 'Stream :: close :: code: ' + code + ', signal: ' + signal );

                if ( typeof code === 'number' && code != 0 ) {
                  exitErr = new Error('Remote process exited with code ' + code );
                } else if ( signal ) {
                  exitErr = new Error('Remote process killed signal ' + signal );
                }

                cb(exitErr);

              }).on( 'data', function(data) {
                // console.log( 'STDOUT: ' + data );
              }).stderr.on( 'data', function(data) {
                // console.log( 'STDERR: ' + data );
              });

              stream.end(cmd);
            });
          } else {
            cb(exitErr);
          }
        });

        tarStream = tar.pack( options.localPath );

        if ( compression ) {
          tarStream = tarStream.pipe( zlib.createGzip() );
        }

        tarStream.pipe( writeStream );
      });
    }

    console.log( 'push options : ' + JSON.stringify(options) );

    conn.on( 'ready', function () {
      transferFile( conn, options, function ( err ) {
        if (err) {
          console.log(err);
          conn.end();
          throw err;
        }
        console.log('Done pushing');
        conn.end();
        done();
      });
    }).connect(options);
  });
};
