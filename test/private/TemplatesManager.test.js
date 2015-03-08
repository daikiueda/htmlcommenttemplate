"use strict";

var expect = require( "chai" ).expect,
    fs = require( "fs" ),
    utils = require( "../utils.js" ),
    TemplatesManager = require( "../../lib/private/TemplatesManager.js" ),
    Template = require( "../../lib/private/Template.js" );

describe( "private / TemplatesManager ＜テンプレート更新処理の流れを管理するクラス＞", function(){

    var testTemplateDirPath = "./.tmp/sample_files/Templates",
        testHTMLFilePath = "./.tmp/sample_files/htdocs/index.html";

    before( utils.prepareSampleFiles );
    after( utils.deleteSampleFiles );

    describe( "Constructor( pathToTemplateDir )", function(){
        it( "テンプレートファイルが格納されているディレクトリのパスを、引数pathToTemplateDirで受け取る。", function(){
            var manager = new TemplatesManager( testTemplateDirPath );
            expect( manager.templateDir ).to.equal( testTemplateDirPath );
        } );
    } );

    describe( "updateHTMLFile()", function(){
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
                expect( fs.readFileSync( "./.tmp/sample_files/Templates/base.tmpl", "utf-8" ) )
                    .to.contain( '<!-- Google Analytics: ' );
            } );

            it( "その過程で（再帰的に）、親テンプレートの初期化・登録処理が実行される。", function(){
                expect( manager.templates[ "Templates/analytics.tmpl" ] )
                    .to.instanceof( Template );
            } );
        } );
    } );
} );
