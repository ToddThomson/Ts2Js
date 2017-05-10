var gulp = require( 'gulp' );
var runSequence = require( 'run-sequence' );
var paths = require( '../paths' );
var tsp = require( "tsproject" );

gulp.task( 'compile', function() {
    return tsp.src( paths.sourceTsConfig )
        .pipe( gulp.dest( paths.output ) );
});

gulp.task( 'build', function( done ) {
    return runSequence(
        'clean',
        ['compile'],
        done
    );
});
