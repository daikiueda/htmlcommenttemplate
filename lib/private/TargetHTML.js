"use strict";

/**
 */

var fs = require( "fs" ),
    Q = require( "q" ),
    cheerio = require( "cheerio" ),
    utils = require( "./utils.js" );

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

    update: function( HTMLCode ){
        var deferred = Q.defer();

        fs.writeFile( this.path, HTMLCode, function( err ){
            if( err ){
                deferred.reject( err );
                return;
            }
            deferred.resolve();
        } );

        return deferred.promise;
    },


    detectTemplateId: function(){

        var commentTagPattern = /<!--\s*InstanceBegin\s+template="\/Templates\/([^"]+)"\s*-->/,
            matchingResult = this.srcHTMLCode.match( commentTagPattern );

        if( matchingResult ){
            return matchingResult[1];
        }
        else {
            return false;
        }
    },

    pickOutValues: function(){
        var values = {},
            $ = cheerio.load( utils.activateTemplateTags( this.srcHTMLCode ) );

        $( "InstanceEditable" ).each( function( index, element ){
            values[ $( element ).attr( "name" ) ] = $( element ).html();
        } );

        return values;
    }
};

module.exports = TargetHTML;