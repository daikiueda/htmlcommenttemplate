"use strict";


var _ = require( "lodash" ),

    ACTIVATE_PATTERNS = {
        "<!--\\s+InstanceBeginEditable\\s+name=\"([^\"]+)\"\\s+-->": "<InstanceEditable name=\"$1\">",
        "<!--\\s+InstanceEndEditable\\s+-->": "</InstanceEditable>"
    };

/**
 * コメントタグで表現されたテンプレート処理用の記述を、DOMとしてパース可能なタグに置き換えて返却する。
 * @param {String} HTMLCode
 * @return {String} activated HTML code.
 */
function activateTemplateTags( HTMLCode ){
    return _.reduce( ACTIVATE_PATTERNS, function( HTMLCode, replacement, pattern ){
        return HTMLCode.replace( new RegExp( pattern, "gi" ), replacement, "gi" )
    }, HTMLCode );
}


module.exports = {
    activateTemplateTags: activateTemplateTags
};

