"use strict";

var shell = require( "shelljs" ),
    htmlcommenttemplate = require( "../lib/htmlcommenttemplate.js" );

describe( "complex", function(){
    before( function(){
        prepareSampleFiles();
    } );

    it( "complex", function( done ){
        htmlcommenttemplate( ".tmp/complex/htdocs/Templates" )( ".tmp/complex/htdocs/index.html" )
            .then( function( result ){
                //console.log( result );
                done();
            } );
    } );
} );

function deleteSampleFiles(){
    shell.rm( "-rf", ".tmp/complex" );
}

function prepareSampleFiles(){
    deleteSampleFiles();
    shell.mkdir( ".tmp" );
    shell.cp( "-r", "./test/fixtures/utf8_complex/htdocs", ".tmp/complex" );
}
