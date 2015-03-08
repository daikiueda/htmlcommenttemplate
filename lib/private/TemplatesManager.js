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
            .finally( deferred.resolve );

        return deferred.promise;
    },

    getTemplate: function( templateId ){
        var deferred = Q.defer();

        if( this.templates[ templateId ] ){
            deferred.resolve( this.templates[ templateId ] );
        }
        else {
            var templatePath = path.resolve( this.templateDir, "../", templateId );

            ( new Template( templateId, templatePath ) )
                .init().done( function( template ){
                    this.templates[ templateId ] = template;
                    deferred.resolve( template );
                }.bind( this ) );
        }

        return deferred.promise;
    }
};

module.exports = TemplatesManager;
