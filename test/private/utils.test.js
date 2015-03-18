"use strict";

var expect = require( "chai" ).expect,
    utils = require( "../../lib/private/utils.js" );

describe( "private / utils", function(){

    describe( "detectTemplateId", function(){

        it( "関連付けされたテンプレートのIDを返却する。", function(){
            expect( utils.detectTemplateId( '<html lang="ja"><!-- InstanceBegin template="/Templates/base.tmpl" -->\n<body>' ) )
                .to.equal( "Templates/base.tmpl" );
        } );
    } );

    describe( "activateTemplateTags", function(){

        var activateTemplateTags = utils.activateTemplateTags;

        describe( "Template用：コメントタグで表現されたテンプレート処理用の記述を、DOMとしてパース可能なタグに置き換えて返却する。", function(){

            it( "TemplateBeginEditable -> <TemplateEditable>", function(){
                expect( activateTemplateTags( "<!-- TemplateBeginEditable name=\"main\" --><!-- TemplateBeginEditable name=\"sub\" -->" ) )
                    .to.equal( "<TemplateEditable name=\"main\"><TemplateEditable name=\"sub\">" );
            } );

            it( "TemplateEndEditable -> </TemplateEditable>", function(){
                expect( activateTemplateTags( "<!-- TemplateEndEditable --><!-- TemplateEndEditable -->" ) )
                    .to.equal( "</TemplateEditable></TemplateEditable>" );
            } );
        } );
    } );

    describe( "activateInstanceTags", function(){

        var activateInstanceTags = utils.activateInstanceTags;

        describe( "Instance用：コメントタグで表現されたテンプレート処理用の記述を、DOMとしてパース可能なタグに置き換えて返却する。", function(){

            it( "InstanceBeginEditable -> <InstanceEditable>", function(){
                expect( activateInstanceTags( "<!-- InstanceBeginEditable name=\"main\" --><!-- InstanceBeginEditable name=\"sub\" -->" ) )
                    .to.equal( "<InstanceEditable name=\"main\"><InstanceEditable name=\"sub\">" );
            } );

            it( "InstanceEndEditable -> </InstanceEditable>", function(){
                expect( activateInstanceTags( "<!-- InstanceEndEditable --><!-- InstanceEndEditable -->" ) )
                    .to.equal( "</InstanceEditable></InstanceEditable>" );
            } );
        } );
    } );

    describe( "excludeInstanceTags", function(){

        var excludeInstanceTags = utils.excludeInstanceTags;

        describe( "<!-- Instance〜 -->を除外したコードを返却する。", function(){

            it( '<!-- InstanceEndEditable -->', function(){
                expect( excludeInstanceTags( '<!-- InstanceEndEditable -->' ) ).to.equal( "" );
            } );

            it( '<!-- InstanceBeginEditable name="***" -->', function(){
                expect( excludeInstanceTags( '<!-- InstanceBeginEditable name="main" -->' ) ).to.equal( "" );
            } );
        } );
    } );
} );
