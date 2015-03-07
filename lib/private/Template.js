"use strict";

var fs = require( "fs" ),
    path = require( "path" ),
    Q = require( "q" ),
    cheerio = require( "cheerio" ),
    _ = require( "lodash" );

/**
 * テンプレートの操作を管理するクラス
 * @param {String} path
 * @param {Object} [options]
 * @constructor
 */
var Template = function( path, options ){
    options = options || {};
    this.path = path;
};
Template.prototype = {

    /**
     * 対象のテンプレートファイルが存在するパス
     * @type String
     */
    path: null,

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

        var $ = cheerio.load( HTMLCode ),
            templateCode;

        _.forEach(
            {
                a: "href",
                img: "src",
                link: "href",
                script: "src"
            },
            function( attr, tagName ){
                $( tagName + "[" + attr + "]" ).each( function( index, elm ){
                    $( elm ).attr( attr, "<%- normalizePath( \"" + this.convertResourcePathAbsolute( $( elm ).attr( attr ) ) + "\" ) %>" );
                }.bind( this ) );
            },
            this
        );

        templateCode = _.reduce(
            {
                "<!-- TemplateBeginEditable name=\"([^\"]+)\" --><!-- TemplateEndEditable -->":
                    "<!-- TemplateBeginEditable name=\"$1\" --><%- $1 %><!-- TemplateEndEditable -->",

                "=\"&lt;%- normalizePath\\( &quot;(.+)&quot; \\) %&gt;\"":
                    "=\"<%- normalizePath( \"$1\" ) %>\""
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

        values.normalizePath = function( resourcePath ){
            return path.relative(
                path.dirname( path.resolve( process.cwd(), targetHTMLFilePath ) ),
                resourcePath
            );
        };

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
