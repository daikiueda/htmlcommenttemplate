"use strict";

/**
 *
 */

var Q = require( "q" ),
    Template = require( "./Template.js" ),
    TargetHTML = require( "./TargetHTML.js" );


var TemplatesManager = function( pathToTemplateDir ){

    this.templateDir = pathToTemplateDir;
    this.updateHTMLFile = this.updateHTMLFile.bind( this );
};
TemplatesManager.prototype = {

    templateDir: null,

    updateHTMLFile: function( pathToHTMLFile ){
        var deferred = Q.defer(),
            targetHTML = new TargetHTML( pathToHTMLFile );

        targetHTML.init()
            .then( function( targetHTML ){ return this.getTemplate( targetHTML.detectTemplate() ); }.bind( this ) )
            .then( function( template ){ return template.generateCode( targetHTML.pickOutValues() ); } )
            .then( function( HTMLCode ){ return targetHTML.update( HTMLCode ); } )
            .catch( function( error ){ deferred.reject( error ) } )
            .finally( deferred.resolve );

        return deferred.promise;
    },

    getTemplate: function( templateId ){
        var deferred = Q.defer();

        var template = new Template( templateId );

        setTimeout( function(){ deferred.resolve( template ) }, 0 );

        return deferred.promise;
    }
};

module.exports = TemplatesManager;
