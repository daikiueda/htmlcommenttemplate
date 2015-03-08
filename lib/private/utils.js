"use strict";

var _ = require( "lodash" );

/**
 * 関連付けされたテンプレートのIDを返却する。
 * @return {String}
 */
function detectTemplateId( HTMLCode ){

    var commentTagPattern = /<!--\s*InstanceBegin\s+template="\/([^"]+)"\s*-->/,
        matchingResult = HTMLCode.match( commentTagPattern );

    if( matchingResult ){
        return matchingResult[1];
    }
    else {
        return null;
    }
}

/**
 * コメントタグで表現されたテンプレート処理用の記述を、DOMとしてパース可能なタグに置き換えて返却する。
 * @param {String} HTMLCode
 * @return {String} activated HTML code.
 */
function activateInstanceTags( HTMLCode ){
    return _.reduce(
        {
            "<!--\\s+InstanceBeginEditable\\s+name=\"([^\"]+)\"\\s+-->": "<InstanceEditable name=\"$1\">",
            "<!--\\s+InstanceEndEditable\\s+-->": "</InstanceEditable>"
        },
        function( HTMLCode, replacement, pattern ){
            return HTMLCode.replace( new RegExp( pattern, "gi" ), replacement, "gi" )
        },
        HTMLCode
    );
}

/**
 * <!-- Instance〜 -->を除外したコードを返却する。
 * @param ｛String｝ HTMLCode
 * @return {String}
 */
function excludeInstanceTags( HTMLCode ){
    return HTMLCode.replace( /\s*<!-- Instance[^>]+ -->/ig, "", "gi" );
}

module.exports = {
    detectTemplateId: detectTemplateId,

    activateInstanceTags: activateInstanceTags,
    excludeInstanceTags: excludeInstanceTags
};