"use strict";

var expect = require( "chai" ).expect,
    fs = require( "fs" ),
    utils = require( "../utils.js" ),
    TargetHTML = require( "../../lib/private/TargetHTML.js" );

describe( "private / TargetHTML ＜更新対象のHTMLファイルを操作するクラス＞", function(){

    var testHTMLFilePath = "./.tmp/sample_files/htdocs/index.html";

    beforeEach( utils.prepareSampleFiles );
    after( utils.deleteSampleFiles );

    describe( "Constructor( path )", function(){
        it( "管理対象のHTMLファイルの格納場所を、引数pathで受け取る。", function(){
            var targetHTML = new TargetHTML( testHTMLFilePath );
            expect( targetHTML.path ).to.equal( testHTMLFilePath );
        } );
    } );

    describe( "init()", function(){

        it( "管理対象のHTMLファイルを読み込み、内部の変数に格納する。", function( done ){
            var targetHTML = new TargetHTML( testHTMLFilePath );
            targetHTML.init().done( function(){
                expect( targetHTML.srcHTMLCode ).to.contain( "<!doctype html>" );
                done();
            } );
        } );
    } );

    describe( "update( HTMLCode )", function(){

        it( "与えられたHTMLCodeで、対象のHTMLファイルの内容を更新する。", function( done ){
            var testHTMLCode = "<dummy></dummy>",
                targetHTML = new TargetHTML( testHTMLFilePath );

            targetHTML.update( testHTMLCode ).done( function(){
                expect( fs.readFileSync( testHTMLFilePath, "utf-8" ) ).to.equal( testHTMLCode );
                done();
            } );
        } );
    } );

    describe( "detectTemplateId()", function(){

        var targetHTML;

        before( function( done ){
            utils.prepareSampleFiles();
            targetHTML = new TargetHTML( testHTMLFilePath );
            targetHTML.init().done( function(){ done(); } );
        } );

        it( "関連付けされたテンプレートのIDを返却する。", function(){
            expect( targetHTML.detectTemplateId() ).to.equal( "Templates/base.tmpl" )
        } );
    } );

    describe( "pickOutValues()", function(){

        var targetHTML;

        before( function( done ){
            utils.prepareSampleFiles();
            targetHTML = new TargetHTML( testHTMLFilePath );
            targetHTML.init().done( function(){ done(); } );
        } );

        it( "管理対象のHTMLファイルから、テンプレートへの適用対象となる内容を抽出し、オブジェクトとして返却する。", function(){
            var values = targetHTML.pickOutValues();
            expect( values ).to.be.an( "object" );
            expect( values ).to.eql( {
                main: "\n            <h1>/index.html</h1>\n            "
            } );
        } );
    } );

    describe( "activateInstanceTags( HTMLCode )", function(){

        var activateTemplateTags = TargetHTML.prototype.activateInstanceTags;

        it( "InstanceBeginEditable -> <InstanceEditable>", function(){
            expect( activateTemplateTags( "<!-- InstanceBeginEditable name=\"main\" --><!-- InstanceBeginEditable name=\"sub\" -->" ) )
                .to.equal( "<InstanceEditable name=\"main\"><InstanceEditable name=\"sub\">" );
        } );

        it( "InstanceEndEditable -> </InstanceEditable>", function(){
            expect( activateTemplateTags( "<!-- InstanceEndEditable --><!-- InstanceEndEditable -->" ) )
                .to.equal( "</InstanceEditable></InstanceEditable>" );
        } );
    } );
} );
