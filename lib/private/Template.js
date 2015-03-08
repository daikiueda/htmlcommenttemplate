"use strict";

var fs = require( "fs" ),
    path = require( "path" ),
    _ = require( "lodash" ),
    Q = require( "q" ),
    cheerio = require( "cheerio" ),
    utils = require( "./utils.js" );

/**
 * テンプレートの操作を管理するクラス
 * @param {String} id
 * @param {String} path
 * @param {Object} [options]
 * @constructor
 */
var Template = function( id, path, options ){
    options = options || {};
    this.id = id;
    this.path = path;
};
Template.prototype = {

    /**
     * テンプレートID
     * @type String
     */
    id: null,

    /**
     * 対象のテンプレートファイルが存在するパス
     * @type String
     */
    path: null,

    /**
     * 親テンプレートのID
     * @type String
     */
    parentTemplateId: null,

    /**
     * コード生成メソッド
     * init()時に初期化される。
     * @type {function}
     */
    processor: null,

    /**
     * 初期化
     * 管理対象のテンプレートファイルを読み込み、テンプレート処理用に変換し、コード生成メソッドを初期化する。
     * @return {promise|*|Q.promise}
     */
    init: function(){
        var deferred = Q.defer();

        fs.readFile( this.path, "utf-8", function( err, data ){

            this.parentTemplateId = utils.detectTemplateId( data );
            this.processor = _.template( this.convertToTemplateFormat( data ) );

            deferred.resolve( this );
        }.bind( this ) );

        return deferred.promise;
    },

    /**
     * 与えられたHTMLコードを、テンプレートエンジンで処理できる文字列に変換して、返却する。
     * @param {String} HTMLCode
     * @return {String}
     */
    convertToTemplateFormat: function( HTMLCode ){

        var instanceTagsExcludedHTMLCode = utils.excludeInstanceTags( HTMLCode ),
            $ = cheerio.load( instanceTagsExcludedHTMLCode ),
            templateCode;

        $( "html" ).prepend( '<!-- InstanceBegin template="/<%- __templateId__ %>" -->' );
        $( "html" ).append( '<!-- InstanceEnd -->' );

        _.forEach(
            {
                a: "href",
                img: "src",
                link: "href",
                script: "src"
            },
            function( attr, tagName ){
                $( tagName + "[" + attr + "]" ).each( function( index, elm ){
                    var testValue = $( elm ).attr( attr );
                    if( testValue.match( /^(#|\/|http:\/\/|https:\/\/)/ ) ) return;
                    $( elm ).attr( attr, "<%- __normalizePath__( \"" + this.convertResourcePathAbsolute( testValue ) + "\" ) %>" );
                }.bind( this ) );
            },
            this
        );

        templateCode = _.reduce(
            {
                "<!-- TemplateBeginEditable name=\"([^\"]+)\" -->[\\s\\S]*?<!-- TemplateEndEditable -->":
                    "<!-- InstanceBeginEditable name=\"$1\" --><%= $1 %><!-- InstanceEndEditable -->",

                "=\"&lt;%- __normalizePath__\\( &quot;(.+)&quot; \\) %&gt;\"":
                    "=\"<%- __normalizePath__( \"$1\" ) %>\""
            },
            function( replacedCode, replacement, pattern ){
                return replacedCode.replace( new RegExp( pattern, "gi" ), replacement, "gi" );
            },
            $.html()
        );

        //console.log( templateCode );

        return templateCode;
    },

    /**
     * values, targetHTMLFilePathを反映したHTMLコードを生成する。
     * @param {Object} values
     * @param {String} targetHTMLFilePath ファイルの場所にあわせてコード内のパス記述を調整するため、必須。
     * @return {promise|*|Q.promise}
     */
    generateCode: function( values, targetHTMLFilePath ){
        var deferred = Q.defer(),
            generatedCode;

        /**
         * テンプレート向けユーティリティ
         * リソースファイルへのパス記述をファイル相対形式で返却する
         * @param {String} resourcePath
         * @return {String}
         */
        values.__normalizePath__ = function( resourcePath ){
            return path.relative(
                path.dirname( path.resolve( process.cwd(), targetHTMLFilePath ) ),
                resourcePath
            ).split( path.sep ).join( "/" );
        };

        values.__templateId__ = this.id;

        try {
            generatedCode = this.processor( values );
        } catch( err ){
            deferred.reject( err );
            return deferred.promise;
        }

        deferred.resolve( generatedCode );
        return deferred.promise;
    },

    /**
     * 与えられたパスをシステム内での絶対パスに変換して返却する。
     * @param {String} resourcePath
     * @return {String}
     */
    convertResourcePathAbsolute: function( resourcePath ){
        return path.resolve( process.cwd(), path.dirname( this.path ), resourcePath );
    }
};

module.exports = Template;
