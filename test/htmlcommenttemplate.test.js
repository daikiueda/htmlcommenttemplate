"use strict";

var expect = require( "chai" ).expect,
    utils = require( "./utils.js" ),
    htmlcommenttemplate = require( "../lib/htmlcommenttemplate.js" );

describe( "htmlcommentemplate( pathToTemplatesDir )", function(){

    before( utils.prepareSampleFiles );
    //after( utils.deleteSampleFiles );

    it( "progress..", function( done ){
        htmlcommenttemplate( "./.tmp/sample_files/Templates" )( "./.tmp/sample_files/htdocs/index.html" )
            .then( function(){
                expect.fail();
                done();
            } )
            .catch( function( error ){
                console.log( error );
                done();
            } );
    } );
} );


