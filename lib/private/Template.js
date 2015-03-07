"use strict";

var fs = require( "fs" ),
    path = require( "path" ),
    Q = require( "q" ),
    cheerio = require( "cheerio" ),
    _ = require( "lodash" ),
    utils = require( "./utils.js" );

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

    path: "",

    init: function(){
        var deferred = Q.defer();

        fs.readFile( this.path, "utf-8", function( err, data ){
            this.processor = _.template( this.convertToTemplateFormat( data ) );
            deferred.resolve( this );
        }.bind( this ) );

        return deferred.promise;
    },

    convertToTemplateFormat: function( srcHTMLCode ){

        var $ = cheerio.load( srcHTMLCode ),
            templateCode;

        _.forEach(
            {
                a: "href",
                img: "src",
                link: "href",
                script: "src"
            },
            function( attr, tagName ){
                $( tagName ).each( function( index, elm ){
                    $( elm ).attr( attr, "<%- normalizePath( \"" + this.getResourcePathAbsolute( $( elm ).attr( attr ) ) + "\" ) %>" );
                }.bind( this ) );
            },
            this
        );

        templateCode = _.reduce(
            {
                "<!-- TemplateBeginEditable name=\"([^\"]+)\" --><!-- TemplateEndEditable -->":
                    "<!-- TemplateBeginEditable name=\"$1\" --><%- $1 %><!-- TemplateEndEditable -->",

                "=\"&lt;%- normalizePath\\( &quot;(.+)&quot; \\) %&gt;\"": "=\"<%- normalizePath( \"$1\" ) %>\""
            },
            function( replacedCode, replacement, pattern ){
                return replacedCode.replace( new RegExp( pattern, "gi" ), replacement, "gi" );
            },
            $.html()
        );

        //console.log( templateCode );

        return templateCode;
    },

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

    getResourcePathAbsolute: function( resourcePath ){
        return path.resolve( process.cwd(), path.dirname( this.path ), resourcePath );
    }
};

module.exports = Template;
