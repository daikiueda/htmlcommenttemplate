"use strict";

var expect = require( "chai" ).expect,
    fs = require( "fs" ),
    utils = require( "../../lib/private/utils.js" );

describe( "private / utils", function(){

    describe( "detectTemplateId", function(){

        it( "関連付けされたテンプレートのIDを返却する。", function(){
            expect( utils.detectTemplateId( '<html lang="ja"><!-- InstanceBegin template="/Templates/base.tmpl" -->\n<body>' ) )
                .to.equal( "Templates/base.tmpl" )
        } );
    } );
} );
