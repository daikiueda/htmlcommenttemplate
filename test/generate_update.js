"use strict";

var htmlcommenttemplate = require( "../lib/htmlcommenttemplate.js" ),
    utils = require( "./utils.js" ),
    shell = require( "shelljs" );

var utilsForComplexSet = {
    deleteSampleFiles: function(){
        shell.rm( "-rf", ".tmp/complex" );
    },
    prepareSampleFiles: function(){
        utilsForComplexSet.deleteSampleFiles();
        shell.mkdir( ".tmp" );
        shell.cp( "-r", "./test/fixtures/utf8_complex/htdocs", ".tmp/complex" );
    }
};

describe( "util", function(){
    it( "generate", function( done ){
        utils.prepareSampleFiles();
        utilsForComplexSet.prepareSampleFiles();
        done();
    } );

    it( "update", function( done ){
        htmlcommenttemplate( "./.tmp/utf8/Templates" )( "./.tmp/utf8/htdocs/**/*.html" )
            .done( function(){ done(); } );
    } );
} );

