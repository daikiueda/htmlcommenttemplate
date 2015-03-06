/*
 * htmlcommenttemplate
 * Copyright (c) 2015 daikiueda, @ue_di
 * Licensed under the MIT license.
 * https://github.com/daikiueda/htmlcommenttemplate
 */
"use strict";

var TemplateManager = require( "./private/TemplatesManager.js" );


function htmlcommenttemplate( pathToTemplateDir ){

    var templateManager = new TemplateManager( pathToTemplateDir );
    return templateManager.updateHTMLFile;
}

module.exports = htmlcommenttemplate;
