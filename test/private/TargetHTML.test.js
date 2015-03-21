"use strict";

var EOL = require( "os" ).EOL,
    expect = require( "chai" ).expect,
    fs = require( "fs" ),
    utils = require( "../utils.js" ),
    TargetHTML = require( "../../lib/private/TargetHTML.js" );

describe( "private / TargetHTML ＜更新対象のHTMLファイルを操作するクラス＞", function(){

    var testHTMLFilePath = "./.tmp/utf8/htdocs/index.html";

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
            expect( targetHTML.detectTemplateId() ).to.equal( "Templates/base.tmpl" );
        } );
    } );

    describe( "pickOutValues()", function(){

        var targetHTML,
            values;

        before( function( done ){
            utils.prepareSampleFiles();
            targetHTML = new TargetHTML( testHTMLFilePath );
            targetHTML.init().done( function(){
                values = targetHTML.pickOutValues();
                done();
            } );
        } );

        describe( "管理対象のHTMLファイルから、テンプレートへの適用対象となる内容を抽出し、オブジェクトとして返却する。", function(){

            it( "返却値は、オブジェクトである。", function(){
                expect( values ).to.be.an( "object" );
            } );

            it( "<!-- InstanceBegin template -->の属性", function(){
                expect( values.__template_attr__ ).to.equal( ' test_attr="test"' );
            } );

            it( "InstanceEditable", function(){
                expect( values.main ).to.contain( "<h1>/index.html</h1>" );
                expect( values.main.split( EOL ) ).to.have.length( 7 );
            } );
        } );

        describe( "各種の文字列", function(){
            it( "日本語の文字列も、そのまま抽出できる。", function(){
                expect( values.main ).to.contain( "<p>ノン・アスキーの文字列</p>" );
            } );

            it( "特殊文字も、そのまま抽出できる。", function(){
                expect( values.main ).to.contain( "<p>&copy;&amp;&trade;</p>" );
            } );

            it( "<!-- comment -->", function(){
                expect( values.main ).to.contain( "<!-- comment -->" );
            } );

            it( "&lt;!-- not comment --&gt;", function(){
                expect( values.main ).to.contain( "&lt;!-- not comment --&gt;" );
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
