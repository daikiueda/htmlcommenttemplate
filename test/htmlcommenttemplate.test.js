"use strict";

var EOL = require( "os" ).EOL,
    expect = require( "chai" ).expect,
    fs = require( "fs" ),
    utils = require( "./utils.js" ),
    htmlcommenttemplate = require( "../lib/htmlcommenttemplate.js" );

describe( "htmlcommentemplate( pathToTemplatesDir )( pathToHTMLFile(s) )", function(){

    var testTemplateDirPath = "./.tmp/sample_files/Templates",
        updatedHTMLFileContent,
        returns,
        promise_results;

    before( function( done ){
        utils.prepareSampleFiles();
        returns = htmlcommenttemplate( testTemplateDirPath )( "./.tmp/sample_files/htdocs/**/*.html" );
        returns
            .done( function( results ){
                promise_results = results;
                fs.readFile( "./.tmp/sample_files/htdocs/sub_dir/sub_sub_dir/index.html", "utf-8", function( err, data ){
                    if( err ){
                        done();
                        return;
                    }
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
                "            common header ノン・アスキー文字<br>"
            ].join( EOL ) );
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
            ].join( EOL ) );
        } );

        it( "未設置の編集可能領域には、テンプレートのデフォルトの内容が適用される。リソースファイルのパス記述は、相対パス形式になる。", function(){
            expect( updatedHTMLFileContent ).to.contain( [
                "            <!-- InstanceBeginEditable name=\"aside\" -->",
                "            <a href=\"../../index.html\">HOME</a>",
                "            <!-- InstanceEndEditable -->"
            ].join( EOL ) );
        } );

        it( "テンプレートで定義されていない編集可能領域は、削除される。", function(){
            expect( updatedHTMLFileContent )
                .not.to.contain( "UNDEFINED EDITABLE AREA" );
        } );
    } );

    describe( "返却値", function(){
        it( "Promise（Q.promise）のインスタンスオブジェクトが返却される。", function(){
            expect( returns ).to.have.property( "then" );
            expect( returns ).to.have.property( "done" );
            expect( returns ).to.have.property( "fail" );
        } );
        it( "promiseオブジェクトは、resolve時に更新ファイルの一覧を渡す。", function(){
            expect( promise_results ).to.have.property( "success" );
            expect( promise_results ).to.have.property( "error" );

            expect( promise_results.success ).to.deep.equal( [
                "./.tmp/sample_files/htdocs/index.html",
                "./.tmp/sample_files/htdocs/sub_dir/index.html",
                "./.tmp/sample_files/htdocs/sub_dir/sub_sub_dir/index.html"
            ] );
        } );
    } );
} );
