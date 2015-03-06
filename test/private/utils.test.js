"use strict";

var expect = require( "chai" ).expect,
    utils = require("../../lib/private/utils.js");

describe( "private / utils", function(){

    describe( "activateTemplateTags( HTMLCode )", function(){

        var activateTemplateTags = utils.activateTemplateTags;

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

