/*
 * htmlcommenttemplate
 * Copyright (c) 2015 daikiueda, @ue_di
 * Licensed under the MIT license.
 * https://github.com/daikiueda/htmlcommenttemplate
 */
"use strict";

var fs = require( "fs" );

function htmlcommenttemplate( updateTargetHTMLFilePath, callback ){
    var srcHTMLCode = fs.readFile( updateTargetHTMLFilePath, "utf-8", function( err, data ){
        console.log( data )
        callback();
    } )
}

module.exports = htmlcommenttemplate;
