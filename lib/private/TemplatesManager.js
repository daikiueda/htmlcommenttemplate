"use strict";

/**
 *
 */

var path = require( "path" ),
    Q = require( "q" ),
    Template = require( "./Template.js" ),
    TargetHTML = require( "./TargetHTML.js" );

/**
 * テンプレート更新処理の流れを管理するクラス
 * @param {String} pathToTemplateDir
 * @constructor
 */
var TemplatesManager = function( pathToTemplateDir ){

    this.templateDir = pathToTemplateDir;
    this.templates = {};

    this.updateHTMLFile = this.updateHTMLFile.bind( this );
};
TemplatesManager.prototype = {

    /**
     * テンプレートファイルが格納されているディレクトリ
     * @type String
     */
    templateDir: null,

    /**
     * Templateクラスを格納するハッシュ
     * @type Object
     */
    templates: null,

    /**
     * 任意のHTMLファイル1点について、更新処理を実行する。
     * @param {String} pathToHTMLFile
     * @return {promise|*|Q.promise}
     */
    updateHTMLFile: function( pathToHTMLFile ){
        var deferred = Q.defer(),
            targetHTML = new TargetHTML( pathToHTMLFile );

        targetHTML.init()
            .then( function( targetHTML ){ return this.getTemplate( targetHTML.detectTemplateId() ); }.bind( this ) )
            .then( function( template ){ return template.generateCode( targetHTML.pickOutValues(), pathToHTMLFile ); } )
            .then( function( HTMLCode ){ return targetHTML.update( HTMLCode ); } )
            .catch( function( error ){ deferred.reject( error ) } )
            .finally( function(){ deferred.resolve() });

        return deferred.promise;
    },

    /**
     * templateIdで指定されたテンプレートを返却する。
     * @param {String} templateId
     * @return {promise|*|Q.promise}
     */
    getTemplate: function( templateId ){
        var deferred = Q.defer();

        if( this.templates[ templateId ] ){
            deferred.resolve( this.templates[ templateId ] );
        }
        else {
            this.registerTemplate( templateId ).done( function( template ){
                deferred.resolve( template );
            } )
        }

        return deferred.promise;
    },

    /**
     * templateIdで指定されたテンプレートを初期化し、内部のハッシュに登録する。
     * @param {String} templateId
     * @param {Boolean} [parentResolved] 親テンプレートの登録が解決している場合はtrue 再帰処理の終了フラグ
     * @return {promise|*|Q.promise}
     */
    registerTemplate: function( templateId, parentResolved ){
        var deferred = Q.defer(),
            templatePath = path.resolve( this.templateDir, "../", templateId );

        ( new Template( templateId, templatePath ) )
            .init().done( function( template ){

                // テンプレートが親のテンプレートを持つ場合、
                // まず該当のテンプレートファイルをHTMLファイルとして更新する。
                if( template.parentTemplateId && !parentResolved ){
                    this.updateHTMLFile( templatePath )
                        .then( function(){ return this.registerTemplate( templateId, true ); }.bind( this ) )
                        .then( function( template ){ deferred.resolve( template ) } );
                }
                else {
                    this.templates[ templateId ] = template;
                    deferred.resolve( template );
                }
            }.bind( this ) );

        return deferred.promise;
    }
};

module.exports = TemplatesManager;
