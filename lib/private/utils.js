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
 * ハッシュで与えられたパターンにマッチする文字列をすべて置換して返却する。
 * @param {String} src
 * @param {Object} patterns
 * @return {String}
 */
function replaceWithPatterns( src, patterns ){
    return _.reduce(
        patterns,
        function( replacedCode, replacement, pattern ){
            return replacedCode.replace( new RegExp( pattern, "gi" ), replacement, "gi" );
        },
        src
    );
}

/**
 * コメントタグで表現されたテンプレート処理用の記述を、DOMとしてパース可能なタグに置き換えて返却する。
 * @param {String} HTMLCode
 * @return {String} activated HTML code.
 */
function activateTemplateTags( HTMLCode ){
    return replaceWithPatterns( HTMLCode, {
        "<!--\\s+TemplateBeginEditable\\s+name=\"([^\"]+)\"\\s+-->": "<TemplateEditable name=\"$1\">",
        "<!--\\s+TemplateEndEditable\\s+-->": "</TemplateEditable>"
    } );
}

/**
 * コメントタグで表現されたテンプレート処理用の記述を、DOMとしてパース可能なタグに置き換えて返却する。
 * @param {String} HTMLCode
 * @return {String} activated HTML code.
 */
function activateInstanceTags( HTMLCode ){
    return replaceWithPatterns( HTMLCode, {
        "<!--\\s+InstanceBeginEditable\\s+name=\"([^\"]+)\"\\s+-->": "<InstanceEditable name=\"$1\">",
        "<!--\\s+InstanceEndEditable\\s+-->": "</InstanceEditable>"
    } );
}

/**
 * <!-- Instance〜 -->を除外したコードを返却する。
 * @param {String} HTMLCode
 * @return {String}
 */
function excludeInstanceTags( HTMLCode ){
    return HTMLCode.replace( /<!-- Instance[^>]+ -->/ig, "", "gi" );
}

module.exports = {
    detectTemplateId: detectTemplateId,
    activateTemplateTags: activateTemplateTags,
    activateInstanceTags: activateInstanceTags,
    excludeInstanceTags: excludeInstanceTags
};
