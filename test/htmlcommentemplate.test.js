"use strict";

var expect = require( "chai" ).expect,
    fs = require( "fs" ),
    shell = require( "shelljs" ),
    htmlcommentemplate = require( "../lib/htmlcommentemplate.js" );

describe( "htmlcommentemplate( pathToTemplatesDir )", function(){

    before( prepareSampleFiles );
//    after( deleteSampleFiles );

    it( "progress..", function( done ){

        htmlcommentemplate( ".tmp/sample/htdocs/index.html", function(){
            done();
            expect.fail();
        } );


    } );
} );

function prepareSampleFiles(){
    deleteSampleFiles();
    shell.mkdir( ".tmp" );
    shell.cp( "-r", "./test/sample", ".tmp" );
}

function deleteSampleFiles(){
    shell.rm( "-rf", ".tmp/sample" )
}
