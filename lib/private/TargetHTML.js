"use strict";

/**
 */

var fs = require( "fs" ),
    Q = require( "q" );

/**
 * 更新対象のHTMLファイルを操作するクラス
 * @param {String} path
 * @param {Object} [options]
 * @constructor
 */
var TargetHTML = function( path, options ){
    options = options || {};

    this.path = path;
};
TargetHTML.prototype = {

    /**
     * 対象のHTMLファイルが存在するパス.
     * @type String
     */
    path: null,

    /**
     * @type String
     */
    srcHTMLCode: null,

    /**
     * 初期化
     * @return {promise|*|Q.promise}
     */
    init: function(){

        var deferred = Q.defer();

        fs.readFile( this.path, "utf-8", function( err, data ){

            this.srcHTMLCode = data;

            deferred.resolve( this );
        }.bind( this ) );

        return deferred.promise;
    },

    update: function(){
        var deferred = Q.defer();
        setTimeout( function(){ deferred.resolve( this ) }, 0 );
        return deferred.promise;
    },

    detectTemplate: function(){

        var commentTagPattern = /<!--\s*InstanceBegin\s+template="\/Templates\/([^"]+)"\s*-->/,
            matchingResult = this.srcHTMLCode.match( commentTagPattern );

        if( matchingResult ){
            return matchingResult[ 1 ];
        }
        else {
            return false;
        }
    },

    pickOutValues: function(){
        return {};
    }
};

module.exports = TargetHTML;