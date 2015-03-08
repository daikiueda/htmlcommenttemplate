"use strict";

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

function excludeInstanceTags( HTMLCode ){
    return HTMLCode.replace( /<!-- Instance[^>]+ -->/ig, "", "gi" );
}

module.exports = {
    detectTemplateId: detectTemplateId,
    excludeInstanceTags: excludeInstanceTags
};