"use strict";

var expect = require( "chai" ).expect,
    fs = require( "fs" ),
    utils = require( "./utils.js" ),
    htmlcommenttemplate = require( "../lib/htmlcommenttemplate.js" );

describe( "htmlcommentemplate( pathToTemplatesDir )( pathToHTMLFile(s) )", function(){

    var testTemplateDirPath = "./.tmp/sample_files/Templates",
        updatedHTMLFileContent;

    before( function( done ){
        utils.prepareSampleFiles();
        htmlcommenttemplate( testTemplateDirPath )( "./.tmp/sample_files/htdocs/**/*.html" )
            .done( function(){
                fs.readFile( "./.tmp/sample_files/htdocs/sub_dir/sub_sub_dir/index.html", "utf-8", function( err, data ){
                    if( err ){ done(); return; }
                    updatedHTMLFileContent = data;
                    done();
                } );
            } );
    } );
    after( utils.deleteSampleFiles );

    describe( "HTMLファイルが更新される。", function(){

        it( "関連付けされたテンプレートの内容が反映される。", function(){
            expect( updatedHTMLFileContent ).to.contain( [
                "        <header>",
                "            common header<br>"
            ].join( "\n" ) );
        } );

        it( "テンプレート部分のリソースファイルのパス記述は、相対パス形式になる。", function(){
            expect( updatedHTMLFileContent )
                .to.contain( '<link rel="stylesheet" href="../../resources/dummy.css">' );
        } );

        it( "ネスト化された上位テンプレートの内容も反映される。", function(){
            expect( updatedHTMLFileContent )
                .to.contain( "<!-- Google Analytics: " );
        } );

        it( "編集可能領域の内容は、変更されない。", function(){
            expect( updatedHTMLFileContent ).to.contain( [
                "            <!-- InstanceBeginEditable name=\"main\" -->",
                "            <h1>/sub_dir/sub_sub_dir/index.html</h1>",
                "            <!-- InstanceEndEditable -->"
            ].join( "\n" ) );
        } );

        it( "未設置の編集可能領域には、テンプレートのデフォルトの内容が適用される。リソースファイルのパス記述は、相対パス形式になる。", function(){
            expect( updatedHTMLFileContent ).to.contain( [
                "            <!-- InstanceBeginEditable name=\"aside\" -->",
                "            <a href=\"../../index.html\">HOME</a>",
                "            <!-- InstanceEndEditable -->"
            ].join( "\n" ) );
        } );

        it( "テンプレートで定義されていない編集可能領域は、削除される。", function(){
            expect( updatedHTMLFileContent )
                .not.to.contain( "UNDEFINED EDITABLE AREA" );
        } );
    } );
} );


