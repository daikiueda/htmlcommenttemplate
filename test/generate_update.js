"use strict";

var htmlcommenttemplate = require( "../lib/htmlcommenttemplate.js" ),
    utils = require( "./utils.js" );

describe( "util", function(){
    it( "generate", function( done ){
        utils.prepareSampleFiles();
        done();
    } );

    it( "update", function( done ){
        htmlcommenttemplate( "./.tmp/utf8/Templates" )( "./.tmp/utf8/htdocs/**/*.html" )
            .done( function(){ done(); } );
    } );
} );
