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
 * @constructor
 */
var Template = function( id, path ){
    this.id = id;
    this.path = path;
    this.defaultValues = {};
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
     * テンプレートファイルの内容から抽出したデフォルト値を格納するハッシュ
     * @type Object
     */
    defaultValues: null,

    /**
     * 初期化
     * 管理対象のテンプレートファイルを読み込み、テンプレート処理用に変換し、コード生成メソッドを初期化する。
     * @return {promise|*|Q.promise}
     */
    init: function(){
        var deferred = Q.defer();

        fs.readFile( this.path, "utf-8", function( err, data ){

            this.parentTemplateId = utils.detectTemplateId( data );
            this.defaultValues = this.pickOutDefaultValues( data );
            this.processor = _.template( this.convertToTemplateFormat( data ) );

            deferred.resolve( this );
        }.bind( this ) );

        return deferred.promise;
    },

    /**
     * 管理対象のテンプレートファイルから、テンプレートへの適用対象となるデフォルト値を抽出し、オブジェクトとして返却する。
     * @param {String} HTMLCode
     * @return {Object}
     */
    pickOutDefaultValues: function( HTMLCode ){
        var values = {},
            $ = cheerio.load( utils.activateTemplateTags( HTMLCode ) );

        $( "TemplateEditable" ).each( function( index, element ){
            values[$( element ).attr( "name" )] = this.convertResourcePathFormat( $( element ).html() );
        }.bind( this ) );

        return values;
    },

    /**
     * 与えられたHTMLコードを、テンプレートエンジンで処理できる文字列に変換して、返却する。
     * @param {String} HTMLCode
     * @return {String}
     */
    convertToTemplateFormat: function( HTMLCode ){

        var instanceTagsExcludedHTMLCode = utils.excludeInstanceTags( HTMLCode ),
            $ = cheerio.load( instanceTagsExcludedHTMLCode );

        $( "html" ).prepend( '<!-- InstanceBegin template="/<%- __templateId__ %>" -->' );
        $( "html" ).append( '<!-- InstanceEnd -->' );

        return _.reduce(
            {
                "<!-- TemplateBeginEditable name=\"([^\"]+)\" -->[\\s\\S]*?<!-- TemplateEndEditable -->":
                    "<!-- InstanceBeginEditable name=\"$1\" --><% if( typeof $1 !== 'undefined' ){ %><%= $1 %><% } else { %><%= __default__.$1 %><% } %><!-- InstanceEndEditable -->"
            },
            function( replacedCode, replacement, pattern ){
                return replacedCode.replace( new RegExp( pattern, "gi" ), replacement, "gi" );
            },
            this.convertResourcePathFormat( $.html() )
        );
    },

    /**
     * リソースファイルへのパス記述を、テンプレート適用の処理で相対形式にできるよう、
     * ユーティリティ関数（__normalizePath）を経由する表現に変換する。
     * @param {String} HTMLCode
     * @return {String}
     */
    convertResourcePathFormat: function( HTMLCode ){
        var $ = cheerio.load( HTMLCode );

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

        return _.reduce(
            {
                "=\"&lt;%- __normalizePath__\\( &quot;(.+)&quot; \\) %&gt;\"":
                    "=\"<%- __normalizePath__( \"$1\" ) %>\""
            },
            function( replacedCode, replacement, pattern ){
                return replacedCode.replace( new RegExp( pattern, "gi" ), replacement, "gi" );
            },
            $.html()
        );
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
        function normalizePath( resourcePath ){
            return path.relative(
                path.dirname( path.resolve( process.cwd(), targetHTMLFilePath ) ),
                resourcePath
            ).split( path.sep ).join( "/" );
        }

        var resolvedDefaultValues = {};
        _.forEach( this.defaultValues, function( value, key ){
            resolvedDefaultValues[ key ] = _.template( value )( {
                __normalizePath__: normalizePath
            } );
        } );

        // テンプレート固有の（更新先HTML由来ではない）パラメータを追加
        values = _.assign( values, {
            __templateId__: this.id,
            __default__: resolvedDefaultValues,
            __normalizePath__: normalizePath
        } );

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
