"use strict";

/**
 *
 */

var path = require( "path" ),
    Q = require( "q" ),
    Template = require( "./Template.js" ),
    TargetHTML = require( "./TargetHTML.js" );


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

    templates: null,

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
