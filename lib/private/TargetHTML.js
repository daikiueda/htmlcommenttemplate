"use strict";

var fs = require( "fs" ),
    _ = require( "lodash" ),
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
     * 対象のHTMLファイルが存在するパス
     * @type String
     */
    path: null,

    /**
     * @type String
     */
    srcHTMLCode: null,

    /**
     * 初期化
     * 管理対象のHTMLファイルを読み込み、内部の変数に格納する。
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

    /**
     * 与えられたHTMLCodeで、対象のHTMLファイルの内容を更新する。
     * @param {String} HTMLCode
     * @return {promise|*|Q.promise}
     */
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

    /**
     * 関連付けされたテンプレートのIDを返却する。
     * @return {String}
     */
    detectTemplateId: function(){
        return utils.detectTemplateId( this.srcHTMLCode );
    },

    /**
     *
     * @return {{}}
     */
    pickOutValues: function(){
        var values = {},
            $ = cheerio.load( this.activateInstanceTags( this.srcHTMLCode ) );

        $( "InstanceEditable" ).each( function( index, element ){
            values[$( element ).attr( "name" )] = $( element ).html();
        } );

        return values;
    },

    /**
     * コメントタグで表現されたテンプレート処理用の記述を、DOMとしてパース可能なタグに置き換えて返却する。
     * @param {String} HTMLCode
     * @return {String} activated HTML code.
     */
    activateInstanceTags: function( HTMLCode ){
        return utils.activateInstanceTags( HTMLCode );
    }
};

module.exports = TargetHTML;