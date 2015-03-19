"use strict";

var expect = require( "chai" ).expect,
    path = require( "path" ),
    fs = require( "fs" ),
    sinon = require( "sinon" ),
    utils = require( "../utils.js" ),
    TemplatesManager = require( "../../lib/private/TemplatesManager.js" ),
    Template = require( "../../lib/private/Template.js" ),
    TargetHTML = require( "../../lib/private/TargetHTML.js" );

describe( "private / TemplatesManager ＜テンプレート更新処理の流れを管理するクラス＞", function(){

    var testTemplateDirPath = "./.tmp/utf8/Templates",
        testHTMLFilePath = "./.tmp/utf8/htdocs/index.html";

    before( utils.prepareSampleFiles );
    after( utils.deleteSampleFiles );

    describe( "Constructor( pathToTemplateDir )", function(){
        it( "テンプレートファイルが格納されているディレクトリのパスを、引数pathToTemplateDirで受け取る。", function(){
            var manager = new TemplatesManager( testTemplateDirPath );
            expect( manager.templateDir ).to.equal( testTemplateDirPath );
        } );
    } );

    describe( "updateEachHTMLFiles( files )", function(){

        var manager = new TemplatesManager( testTemplateDirPath ),
            spy;

        describe( "任意の複数のHTMLファイルについて、更新処理を実行する。", function(){

            beforeEach( function(){
                spy = sinon.spy( TargetHTML.prototype, "update" );
            } );
            afterEach( function(){ spy.restore(); } );

            describe( "globパターン", function(){
                it( '"htdocs/**/*.html"', function( done ){
                    manager.updateEachHTMLFiles( "./.tmp/utf8/**/*.html" )
                        .then( function(){
                            expect( spy.callCount ).to.equal( 4 );
                            expect( spy.thisValues[0].path ).to.include( path.join( "utf8", "Templates", "base.tmpl" ) );
                            expect( spy.thisValues[1].path ).to.include( "utf8/htdocs/index.html" );
                            expect( spy.thisValues[2].path ).to.include( "utf8/htdocs/sub_dir/index.html" );
                            expect( spy.thisValues[3].path ).to.include( "utf8/htdocs/sub_dir/sub_sub_dir/index.html" );
                            done();
                        } )
                        .catch( function( e ){
                            done( e );
                        } );
                } );
            } );

            describe( "パターンの配列（＋除外パターンの指定）", function(){
                it( '[ "htdocs/index.html", "htdocs/sub_dir/index.html" ]', function( done ){
                    manager.updateEachHTMLFiles( [ "./.tmp/utf8/htdocs/index.html", "./.tmp/utf8/htdocs/sub_dir/index.html" ] )
                        .done( function(){
                            expect( spy.callCount ).to.equal( 2 );
                            expect( spy.thisValues[0].path ).to.include( "utf8/htdocs/index.html" );
                            expect( spy.thisValues[1].path ).to.include( "utf8/htdocs/sub_dir/index.html" );
                            done();
                        } );
                } );

                it( '[ "htdocs/**/*.html", "!htdocs/sub_dir/index.html" ]', function( done ){
                    manager.updateEachHTMLFiles( [ "./.tmp/utf8/htdocs/**/*.html", "!./.tmp/utf8/htdocs/sub_dir/index.html" ] )
                        .done( function(){
                            expect( spy.callCount ).to.equal( 2 );
                            expect( spy.thisValues[0].path ).to.include( "utf8/htdocs/index.html" );
                            expect( spy.thisValues[1].path ).to.include( "utf8/htdocs/sub_dir/sub_sub_dir/index.html" );
                            done();
                        } );
                } );

                it( '[ "**/*.{html,tmpl}", "!htdocs/sub_dir/index.html", "!Templates/analytics.tmpl" ]', function( done ){
                    manager.updateEachHTMLFiles( [
                        "./.tmp/utf8/htdocs/**/*.html",
                        "!./.tmp/utf8/htdocs/sub_dir/index.html",
                        "!./.tmp/utf8/Templates/analytics.tmpl"
                    ] )
                        .done( function(){
                            expect( spy.callCount ).to.equal( 2 );
                            expect( spy.thisValues[0].path ).to.include( "utf8/htdocs/index.html" );
                            expect( spy.thisValues[1].path ).to.include( "utf8/htdocs/sub_dir/sub_sub_dir/index.html" );
                            done();
                        } );
                } );
            } );

            describe( "ディレクトリ指定", function(){

                it( '"htdocs/sub_dir/"' );

                it( '"htdocs/sub_dir"' );

                it( "配列でディレクトリの除外パターンが指定された場合。" );

            } );

            describe( "その他、想定される特殊なケース", function(){
                it( '"htdocs/index.html"', function( done ){
                    manager.updateEachHTMLFiles( "./.tmp/utf8/htdocs/index.html" )
                        .done( function(){
                            expect( spy.callCount ).to.equal( 1 );
                            expect( spy.thisValues[0].path ).to.include( "utf8/htdocs/index.html" );
                            done();
                        } );
                } );
            } );
        } );
    } );

    describe( "updateHTMLFile()", function(){

        before( utils.prepareSampleFiles );

        it( "任意のHTMLファイル1点について、更新処理を実行する。", function( done ){
            ( new TemplatesManager( testTemplateDirPath ) ).updateHTMLFile( testHTMLFilePath )
                .done( function(){
                    expect( fs.readFileSync( testHTMLFilePath, "utf-8" ) )
                        .to.contain( '<!-- InstanceBeginEditable name="aside" -->' );
                    done();
                } );
        } );
    } );

    describe( "getTemplate( templateId )", function(){

        var manager = new TemplatesManager( testTemplateDirPath );

        it( "templateIdで指定されたテンプレートを返却する。", function( done ){
            manager.getTemplate( "Templates/analytics.tmpl" )
                .done( function( template ){
                    expect( template ).to.instanceof( Template );
                    done();
                } );
        } );
    } );

    describe( "registerTemplate( templateId, [parentResolved]  )", function(){

        it( "templateIdで指定されたテンプレートを初期化し、内部のハッシュに登録する。", function( done ){
            var manager = new TemplatesManager( testTemplateDirPath );
            manager.registerTemplate( "Templates/analytics.tmpl" )
                .done( function( template ){
                    expect( manager.templates[ "Templates/analytics.tmpl" ] ).to.equal( template );
                    done();
                } );
        } );

        describe( "指定されたテンプレートが、親テンプレートの指定を持つ場合", function(){

            var manager = new TemplatesManager( testTemplateDirPath );

            before( function( done ){
                utils.prepareSampleFiles();
                manager.registerTemplate( "Templates/base.tmpl" ).done( function(){ done(); } );
            } );

            it( "子テンプレートの内容が、親テンプレートの内容にあわせて更新される。", function(){
                expect( fs.readFileSync( "./.tmp/utf8/Templates/base.tmpl", "utf-8" ) )
                    .to.contain( '<!-- Google Analytics: ' );
            } );

            it( "その過程で（再帰的に）、親テンプレートの初期化・登録処理が実行される。", function(){
                expect( manager.templates[ "Templates/analytics.tmpl" ] )
                    .to.instanceof( Template );
            } );
        } );
    } );
} );
