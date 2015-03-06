"use strict";

var expect = require( "chai" ).expect,
    shell = require( "shelljs" ),
    htmlcommenttemplate = require( "../lib/htmlcommenttemplate.js" );

describe( "htmlcommentemplate( pathToTemplatesDir )", function(){

    before( prepareSampleFiles );
//    after( deleteSampleFiles );

    it( "progress..", function( done ){
        htmlcommenttemplate( "./.tmp/sample_files/Templates" )( "./.tmp/sample_files/htdocs/index.html" )
            .done( function(){
                done();
            } );
    } );
} );

function prepareSampleFiles(){
    deleteSampleFiles();
    shell.mkdir( ".tmp" );
    shell.cp( "-r", "./sample_files", ".tmp" );
}

function deleteSampleFiles(){
    shell.rm( "-rf", ".tmp/sample_files" )
}
