"use strict";

var expect = require( "chai" ).expect,
    utils = require( "../utils.js" ),
    Template = require( "../../lib/private/Template.js" );

describe( "private / Templates ＜テンプレートの操作を管理するクラス＞", function(){

    var testTemplateFilePath = "./.tmp/sample_files/Templates/base.tmpl";

    before( utils.prepareSampleFiles );
    //after( utils.deleteSampleFiles );

    describe( "Constructor()", function(){
        it( "管理対象のテンプレートファイルの格納場所を、引数pathで受け取る。", function(){
            var template = new Template( testTemplateFilePath );
            expect( template.path ).to.equal( testTemplateFilePath );
        } );
    } );

    describe( "init()", function(){

        it( "管理対象のテンプレートファイルを読み込み、テンプレート処理用に変換し、コード生成メソッドを初期化する。", function( done ){
            ( new Template( testTemplateFilePath ) ).init().done( function( template ){
                expect( template.processor ).to.be.a( "function" );
                done();
            } )
        } );
    } );

    describe( "convertToTemplateFormat( HTMLCode )", function(){

        it( "与えられたHTMLコードを、テンプレートエンジンで処理できる文字列に変換して、返却する。" )
    } );

    describe( "generateCode( values )", function(){

        it( "values, targetHTMLFilePathを反映したHTMLコードを生成する。", function( done ){
            ( new Template( testTemplateFilePath ) ).init()
                .then( function( template ){
                    return template.generateCode( { main: "aaa" }, "./.tmp/sample_files/htdocs/sub_dir/index.html" );
                } )
                .then( function( generatedCode ){
                    //console.log( generatedCode );
                    done();
                } );
        } );

        describe( "エラーケース", function(){
            it( "error", function( done ){
                ( new Template( testTemplateFilePath ) ).init()
                    .then( function( template ){
                        return template.generateCode( {} );
                    } )
                    .catch( function( reason ){
                        //console.log( reason );
                        done();
                    } );
            } );
        } );
    } );

    describe( "convertResourcePathAbsolute( resourcePath )", function(){

        it( "与えられたパスをシステム内での絶対パスに変換して返却する。" );
    } );
} );
