"use strict";

var expect = require( "chai" ).expect,
    utils = require( "../utils.js" ),
    Template = require( "../../lib/private/Template.js" );

/*eslint camelcase:0 */
describe( "private / Templates ＜テンプレートの操作を管理するクラス＞", function(){

    var testTemplateId = "Templates/base.tmpl",
        testTemplateFilePath = "./.tmp/utf8/Templates/base.tmpl";

    before( utils.prepareSampleFiles );
    after( utils.deleteSampleFiles );

    describe( "Constructor( id, pathToTemplateFile )", function(){
        it( "管理対象のテンプレートのIDとファイルの格納場所を、引数で受け取る。", function(){
            var template = new Template( testTemplateId, testTemplateFilePath );
            expect( template.id ).to.equal( testTemplateId );
            expect( template.path ).to.equal( testTemplateFilePath );
        } );
    } );

    describe( "init()", function(){

        it( "管理対象のテンプレートファイルを読み込み、テンプレート処理用に変換し、コード生成メソッドを初期化する。", function( done ){
            ( new Template( testTemplateId, testTemplateFilePath ) ).init().done( function( template ){
                expect( template.processor ).to.be.a( "function" );
                done();
            } );
        } );
    } );

    describe( "pickOutDefaultValues()", function(){

        var template;

        before( function( done ){
            template = new Template( testTemplateId, testTemplateFilePath );
            template.init().done( function(){ done(); } );
        } );

        describe( "管理対象のテンプレートファイルから、テンプレートへの適用対象となるデフォルト値を抽出し、オブジェクトとして返却する。", function(){

            describe( "テンプレートの属性", function(){
                it( "InstanceBegin", function(){
                    expect( template.pickOutDefaultValues( '<!-- InstanceBegin template="/Templates/base.tmpl" test_attr="test" -->' ) )
                        .to.have.property( "__template_attr__" )
                        .and.equal( ' test_attr="test"' );
                } );
            } );

            describe( "Editable 編集可能領域", function(){
                it( "TemplateBeginEditable", function(){
                    expect( template.pickOutDefaultValues( '<!-- TemplateBeginEditable name="main" -->MAIN_DEFAULT<!-- TemplateEndEditable -->' ) )
                        .to.eql( { main: "MAIN_DEFAULT" } );
                } );

                it( "InstanceBeginEditable（親テンプレートで定義）", function(){
                    expect( template.pickOutDefaultValues( '<!-- InstanceBeginEditable name="sub" -->SUB_DEFAULT<!-- InstanceEndEditable -->' ) )
                        .to.eql( { sub: "SUB_DEFAULT" } );
                } );


                it( "リソースファイルへのパス記述は、ユーティリティ関数（__normalizePath__）を経由する表現に変換される。", function(){
                    expect( template.pickOutDefaultValues( '<!-- TemplateBeginEditable name="main" --><a href="hogehoge/index.html">hogehoge</a><!-- TemplateEndEditable -->' ) )
                        .to.have.property( "main" )
                        .and.match( /<a href="<%- __normalizePath__\( ".+hogehoge(\/|\\\\)index.html" \) %>">hogehoge<\/a>/ );
                } );

                describe( "BeginEditableの入れ子", function(){
                    it( "基本的に、Instance/Templateを問わず全ての値が抽出される。", function(){
                        expect( template.pickOutDefaultValues( [
                            '<!-- InstanceBeginEditable name="main" -->',
                            'PARENT_VALUE',
                            '<!-- TemplateBeginEditable name="sub1" -->SUB_1_VALUE<!-- TemplateEndEditable -->',
                            '<!-- InstanceEndEditable -->'
                        ].join( "" ) ) )
                            .to.eql( {
                                main: "PARENT_VALUE<!-- TemplateBeginEditable name=\"sub1\" -->SUB_1_VALUE<!-- TemplateEndEditable -->",
                                sub1: "SUB_1_VALUE"
                            } );
                    } );

                    it( "同名の場合は、内側の値が採用される。", function(){
                        expect( template.pickOutDefaultValues( [
                            '<!-- InstanceBeginEditable name="main" -->',
                            'PARENT_VALUE',
                            '<!-- TemplateBeginEditable name="main" -->SELF_VALUE<!-- TemplateEndEditable -->',
                            '<!-- InstanceEndEditable -->'
                        ].join( "" ) ) )
                            .to.eql( { main: "SELF_VALUE" } );
                    } );
                } );

                describe( "各種の文字列", function(){
                    it( "日本語の文字列も、そのまま抽出できる。", function(){
                        var testStr = "ノン・アスキーの文字列";
                        expect( template.pickOutDefaultValues( '<!-- InstanceBeginEditable name="test" -->' + testStr + '<!-- InstanceEndEditable -->' ) )
                            .to.eql( { test: testStr } );
                    } );

                    it( "特殊文字も、そのまま抽出できる。", function(){
                        var testStr = "<p>&copy;&#169;&#xA9;©&amp;&trade;</p>";
                        expect( template.pickOutDefaultValues( '<!-- InstanceBeginEditable name="test" -->' + testStr + '<!-- InstanceEndEditable -->' ) )
                            .to.eql( { test: testStr } );
                    } );

                    it( "<!-- comment -->", function(){
                        var testStr = "<!-- comment -->";
                        expect( template.pickOutDefaultValues( '<!-- InstanceBeginEditable name="test" -->' + testStr + '<!-- InstanceEndEditable -->' ) )
                            .to.eql( { test: testStr } );
                    } );

                    it( "&lt;!-- not comment --&gt;", function(){
                        var testStr = "&lt;!-- not comment --&gt;";
                        expect( template.pickOutDefaultValues( '<!-- InstanceBeginEditable name="test" -->' + testStr + '<!-- InstanceEndEditable -->' ) )
                            .to.eql( { test: testStr } );
                    } );
                } );
            } );
        } );
    } );

    describe( "convertToTemplateFormat( HTMLCode )", function(){

        var template = new Template( testTemplateId, testTemplateFilePath );

        describe( "与えられたHTMLコードを、テンプレートエンジンで処理できる文字列に変換して、返却する。", function(){

            describe( "テンプレートIDと、テンプレートの属性", function(){

                it( '<html> 〜 </html> -> <html><!-- InstanceBegin template="***" (attr) --> 〜 <!-- InstanceEnd --></html>"', function(){
                    expect( template.convertToTemplateFormat(
                        '<html></html>'
                    ) ).to.match( /<html><!-- InstanceBegin template="\/Templates\/base.tmpl"<%.+%> --><!-- InstanceEnd --><\/html>/ );
                } );
            } );

            describe( "プレースホルダ", function(){

                describe( "<!-- TemplateBeginEditable --> 〜 <!-- TemplateEndEditable -->", function(){

                    it( "ひとつのEditable領域", function(){
                        expect( template.convertToTemplateFormat(
                            '<!-- TemplateBeginEditable name="main" --><!-- TemplateEndEditable -->'
                        ) ).to.equal( '<!-- InstanceBeginEditable name="main" --><% if( typeof main !== \'undefined\' ){ %><%= main %><% } else { %><%= __default__.main %><% } %><!-- InstanceEndEditable -->' );
                    } );

                    it( "複数のEditable領域", function(){
                        expect( template.convertToTemplateFormat(
                            [
                                '<!-- TemplateBeginEditable name="main" -->\n\t hoge main \n\t<!-- TemplateEndEditable -->',
                                '<!-- TemplateBeginEditable name="sub" -->\n\t hoge sub \n\t<!-- TemplateEndEditable -->'
                            ].join( "" )
                        ) ).to.equal( [
                                '<!-- InstanceBeginEditable name="main" --><% if( typeof main !== \'undefined\' ){ %><%= main %><% } else { %><%= __default__.main %><% } %><!-- InstanceEndEditable -->',
                                '<!-- InstanceBeginEditable name="sub" --><% if( typeof sub !== \'undefined\' ){ %><%= sub %><% } else { %><%= __default__.sub %><% } %><!-- InstanceEndEditable -->'
                            ].join( "" ) );
                    } );

                    it( "Editable領域の入れ子（同名）", function(){
                        expect( template.convertToTemplateFormat(
                            [
                                '<!-- InstanceBeginEditable name="doc_info" -->',
                                'common',
                                '<!-- TemplateBeginEditable name="doc_info" -->',
                                '<title>Document</title>',
                                '<!-- TemplateEndEditable -->',
                                '<!-- InstanceEndEditable -->'
                            ].join( "" )
                        ) ).to.equal( [
                                'common',
                                '<!-- InstanceBeginEditable name="doc_info" -->',
                                '<% if( typeof doc_info !== \'undefined\' ){ %><%= doc_info %><% } else { %><%= __default__.doc_info %><% } %>',
                                '<!-- InstanceEndEditable -->'
                            ].join( "" ) );
                    } );

                    it( "Editable領域の入れ子（別名）", function(){
                        expect( template.convertToTemplateFormat(
                            [
                                '<!-- InstanceBeginEditable name="doc_info" -->',
                                'common',
                                '<!-- TemplateBeginEditable name="main" -->',
                                '<title>MAIN</title>',
                                '<!-- TemplateEndEditable -->',
                                '<!-- TemplateBeginEditable name="sub" -->',
                                '<title>SUB</title>',
                                '<!-- TemplateEndEditable -->',
                                '<!-- InstanceEndEditable -->'
                            ].join( "" )
                        ) ).to.equal( [
                                'common',
                                '<!-- InstanceBeginEditable name="main" -->',
                                '<% if( typeof main !== \'undefined\' ){ %><%= main %><% } else { %><%= __default__.main %><% } %>',
                                '<!-- InstanceEndEditable -->',
                                '<!-- InstanceBeginEditable name="sub" -->',
                                '<% if( typeof sub !== \'undefined\' ){ %><%= sub %><% } else { %><%= __default__.sub %><% } %>',
                                '<!-- InstanceEndEditable -->'
                            ].join( "" ) );
                    } );
                } );
            } );

            describe( "リソースファイルへのパス記述", function(){

                it( "convertResourcePathFormatメソッドによる変換が実行される。", function(){
                    expect( template.convertToTemplateFormat( '<a href="hogehoge/index.html">hogehoge</a>' ) )
                        .to.equal( template.convertResourcePathFormat( '<a href="hogehoge/index.html">hogehoge</a>' ) );
                } );
            } );
        } );
    } );

    describe( "convertResourcePathFormat( HTMLCode )", function(){

        var template = new Template( testTemplateId, testTemplateFilePath );

        describe( "リソースファイルへのパス記述を、テンプレート適用の処理で相対形式にできるよう、ユーティリティ関数（__normalizePath）を経由する表現に変換する。", function(){
            it( "a[href]", function(){
                expect( template.convertResourcePathFormat( '<a href="hogehoge/index.html">hogehoge</a>' ) )
                    .to.match( /<a href="<%- __normalizePath__\( ".+hogehoge(\/|\\\\)index.html" \) %>">hogehoge<\/a>/ );
            } );

            it( "img[src]", function(){
                expect( template.convertResourcePathFormat( '<img src="hogehoge/hoge.gif" alt="hoge">' ) )
                    .to.match( /<img src="<%- __normalizePath__\( ".+hogehoge(\/|\\\\)hoge.gif" \) %>" alt="hoge">/ );
            } );

            it( "link[href]", function(){
                expect( template.convertResourcePathFormat( '<link rel="stylesheet" href="hogehoge/hoge.css">' ) )
                    .to.match( /<link rel="stylesheet" href="<%- __normalizePath__\( ".+hogehoge(\/|\\\\)hoge.css" \) %>">/ );
            } );

            it( "script[src]", function(){
                expect( template.convertResourcePathFormat( '<script src="hogehoge/hoge.js"></script>' ) )
                    .to.match( /<script src="<%- __normalizePath__\( ".+hogehoge(\/|\\\\)hoge.js" \) %>"><\/script>/ );
            } );

            describe( "パス記述の調整が適用されるべきでないケース", function(){

                it( "同一ページ内のアンカーリンク記述", function(){
                    expect( template.convertResourcePathFormat( '<a href="#">text</a>' ) )
                        .to.equal( '<a href="#">text</a>' );
                } );

                it( "サイトルート相対パス記述", function(){
                    expect( template.convertResourcePathFormat( '<a href="/hogehoge/hoge">text</a>' ) )
                        .to.equal( '<a href="/hogehoge/hoge">text</a>' );
                } );

                describe( "絶対パス記述", function(){

                    it( "http://はじまり", function(){
                        expect( template.convertResourcePathFormat( '<a href="http://hoge.hoge/">text</a>' ) )
                            .to.equal( '<a href="http://hoge.hoge/">text</a>' );
                    } );

                    it( "https://はじまり", function(){
                        expect( template.convertResourcePathFormat( '<a href="https://hoge.hoge/">text</a>' ) )
                            .to.equal( '<a href="https://hoge.hoge/">text</a>' );
                    } );

                    it( "//はじまり", function(){
                        expect( template.convertResourcePathFormat( '<a href="//hoge.hoge/">text</a>' ) )
                            .to.equal( '<a href="//hoge.hoge/">text</a>' );
                    } );
                } );

                describe( "前出のHTML要素のなかで、パス記述がない場合", function(){

                    it( "a", function(){
                        expect( template.convertResourcePathFormat( '<a name="hoge">text</a>' ) )
                            .to.equal( '<a name="hoge">text</a>' );
                    } );

                    it( "script", function(){
                        expect( template.convertResourcePathFormat( '<script>\n/* test */\n</script>' ) )
                            .to.equal( '<script>\n/* test */\n</script>' );
                    } );
                } );
            } );
        } );
    } );

    describe( "generateCode( values )", function(){

        it( "values, targetHTMLFilePathを反映したHTMLコードを生成する。", function( done ){
            ( new Template( testTemplateId, testTemplateFilePath ) ).init()
                .then( function( template ){
                    return template.generateCode(
                        { main: "_M_A_I_N_", doc_info: "<title>test result</title>" },
                        "./.tmp/utf8/htdocs/sub_dir/index.html"
                    );
                } )
                .then( function( generatedCode ){
                    expect( generatedCode ).to.contain( '<!-- InstanceBeginEditable name="main" -->_M_A_I_N_<!-- InstanceEndEditable -->' );
                    expect( generatedCode ).to.contain( '<a href="../index.html">HOME</a>' );
                    done();
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
