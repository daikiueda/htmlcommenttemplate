"use strict";

var expect = require( "chai" ).expect,
    TargetHTML = require( "../../lib/private/TargetHTML.js" );

describe( "private / TargetHTML", function(){

    describe( "Constructor()", function(){
        it( "" );
    } );

    describe( "init( path )", function(){

        it( "正常", function( done ){
            var targetHTML = new TargetHTML( "./sample_files/htdocs/index.html" );
            targetHTML.init().done( function(){
                expect( targetHTML.srcHTMLCode ).to.contains( "<!DOCTYPE html>" );
                done();
            } );
        } );
    } );

    describe( "update()", function(){
        it( "" );
    } );

    describe( "detectTemplate()", function(){

        var targetHTML;

        before( function( done ){
            targetHTML = new TargetHTML( "./sample_files/htdocs/index.html" );
            targetHTML.init().done( function(){ done(); } );
        } );

        it( "テンプレートファイルのパス・ファイル名を返却する。", function(){
            expect( targetHTML.detectTemplate() ).to.equal( "base.tmpl" )
        } );
    } );

    describe( "pickOutValues()", function(){
        it( "" );
    } );
} );
