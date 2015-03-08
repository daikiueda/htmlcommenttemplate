"use strict";

var expect = require( "chai" ).expect,
    utils = require( "../utils.js" ),
    Template = require( "../../lib/private/Template.js" );

describe( "private / Templates ＜テンプレートの操作を管理するクラス＞", function(){

    var testTemplateId = "/Templates/base.tmpl",
        testTemplateFilePath = "./.tmp/sample_files/Templates/base.tmpl";

    before( utils.prepareSampleFiles );
    after( utils.deleteSampleFiles );

    describe( "Constructor()", function(){
        it( "管理対象のテンプレートファイルの格納場所を、引数pathで受け取る。", function(){
            var template = new Template( testTemplateId, testTemplateFilePath );
            expect( template.path ).to.equal( testTemplateFilePath );
        } );
    } );

    describe( "init()", function(){

        it( "管理対象のテンプレートファイルを読み込み、テンプレート処理用に変換し、コード生成メソッドを初期化する。", function( done ){
            ( new Template( testTemplateId, testTemplateFilePath ) ).init().done( function( template ){
                expect( template.processor ).to.be.a( "function" );
                done();
            } )
        } );
    } );

    describe( "convertToTemplateFormat( HTMLCode )", function(){

        var template = new Template( testTemplateId, testTemplateFilePath );

        describe( "与えられたHTMLコードを、テンプレートエンジンで処理できる文字列に変換して、返却する。", function(){

            describe( "テンプレートID", function(){

                it( '<html> 〜 </html> -> <html><!-- InstanceBegin template="***" --> 〜 <!-- InstanceEnd --></html>"', function(){
                    expect( template.convertToTemplateFormat(
                        '<html></html>'
                    ) ).to.equal( '<html><!-- InstanceBegin template="/<%- __templateId__ %>" --><!-- InstanceEnd --></html>' );
                } );
            } );

            describe( "プレースホルダ", function(){

                it( "<!-- TemplateBeginEditable --> 〜 <!-- TemplateEndEditable -->", function(){
                    expect( template.convertToTemplateFormat(
                        '<!-- TemplateBeginEditable name="main" --><!-- TemplateEndEditable -->'
                    ) ).to.equal( '<!-- TemplateBeginEditable name="main" --><%= main %><!-- TemplateEndEditable -->' );
                } );
            } );

            describe( "リソースファイルへのパス記述", function(){

                it( "a[href]", function(){
                    expect( template.convertToTemplateFormat( '<a href="hogehoge/index.html">hogehoge</a>' ) )
                        .to.match( /<a href="<%- __normalizePath__\( ".+hogehoge\/index.html" \) %>">hogehoge<\/a>/ );
                } );

                it( "img[src]", function(){
                    expect( template.convertToTemplateFormat( '<img src="hogehoge/hoge.gif" alt="hoge">' ) )
                        .to.match( /<img src="<%- __normalizePath__\( ".+hogehoge\/hoge.gif" \) %>" alt="hoge">/ );
                } );

                it( "link[href]", function(){
                    expect( template.convertToTemplateFormat( '<link rel="stylesheet" href="hogehoge/hoge.css">' ) )
                        .to.match( /<link rel="stylesheet" href="<%- __normalizePath__\( ".+hogehoge\/hoge.css" \) %>">/ );
                } );

                it( "script[src]", function(){
                    expect( template.convertToTemplateFormat( '<script src="hogehoge/hoge.js"></script>' ) )
                        .to.match( /<script src="<%- __normalizePath__\( ".+hogehoge\/hoge.js" \) %>"><\/script>/ );
                } );

                describe( "パス記述の調整が適用されるべきでないケース", function(){

                    it( "同一ページ内のアンカーリンク記述", function(){
                        expect( template.convertToTemplateFormat( '<a href="#">text</a>' ) )
                            .to.equal( '<a href="#">text</a>' );
                    } );

                    it( "サイトルート相対パス記述", function(){
                        expect( template.convertToTemplateFormat( '<a href="/hogehoge/hoge">text</a>' ) )
                            .to.equal( '<a href="/hogehoge/hoge">text</a>' );
                    } );

                    describe( "絶対パス記述", function(){

                        it( "http://はじまり", function(){
                            expect( template.convertToTemplateFormat( '<a href="http://hoge.hoge/">text</a>' ) )
                                .to.equal( '<a href="http://hoge.hoge/">text</a>' );
                        } );

                        it( "https://はじまり", function(){
                            expect( template.convertToTemplateFormat( '<a href="https://hoge.hoge/">text</a>' ) )
                                .to.equal( '<a href="https://hoge.hoge/">text</a>' );
                        } );

                        it( "//はじまり", function(){
                            expect( template.convertToTemplateFormat( '<a href="//hoge.hoge/">text</a>' ) )
                                .to.equal( '<a href="//hoge.hoge/">text</a>' );
                        } );
                    } );

                    describe( "前出のHTML要素のなかで、パス記述がない場合", function(){

                        it( "a", function(){
                            expect( template.convertToTemplateFormat( '<a name="hoge">text</a>' ) )
                                .to.equal( '<a name="hoge">text</a>' );
                        } );

                        it( "script", function(){
                            expect( template.convertToTemplateFormat( '<script>\n/* test */\n</script>' ) )
                                .to.equal( '<script>\n/* test */\n</script>' );
                        }  );
                    } );
                } );
            } );
        } );
    } );

    describe( "generateCode( values )", function(){

        it( "values, targetHTMLFilePathを反映したHTMLコードを生成する。", function( done ){
            ( new Template( testTemplateId, testTemplateFilePath ) ).init()
                .then( function( template ){
                    return template.generateCode( { main: "_M_A_I_N_" }, "./.tmp/sample_files/htdocs/sub_dir/index.html" );
                } )
                .then( function( generatedCode ){
                    expect( generatedCode ).to.contain( '<!-- TemplateBeginEditable name="main" -->_M_A_I_N_<!-- TemplateEndEditable -->' );
                    expect( generatedCode ).to.contain( '<a href="../index.html">HOME</a>' );
                    done();
                } );
        } );

        describe( "エラーケース", function(){

            it( "テンプレートに適用するvaluesに不足がある場合", function( done ){
                ( new Template( testTemplateId, testTemplateFilePath ) ).init()
                    .then( function( template ){
                        return template.generateCode( {}, "" );
                    } )
                    .catch( function( error ){
                        expect( error ).to.be.an.instanceof( Error );
                        done();
                    } );
            } );
        } );
    } );

    describe( "convertResourcePathAbsolute( resourcePath )", function(){

        it( "与えられたパスをシステム内での絶対パスに変換して返却する。", function(){
            var testPath = ( new Template( "/hoge", "./hoge/hoge/hoge.tmpl" ) ).convertResourcePathAbsolute( "../foo.foo" );
            expect( testPath ).to.equal( require( "path" ).join( process.cwd(), "hoge", "foo.foo" ) );
        } );
    } );
} );
