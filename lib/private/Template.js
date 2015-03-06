"use strict";

var fs = require( "fs" ),
    Q = require( "q" );

/**
 *
 */


var Template = function( path, options ){
    options = options || {};
};
Template.prototype = {

    init: function(){
        var deferred = Q.defer();
        setTimeout( function(){ deferred.resolve( this ) }, 0 );
        return deferred.promise;
    },

    generateCode: function( values ){
        var deferred = Q.defer();
        setTimeout( function(){ deferred.resolve( this ) }, 0 );
        return deferred.promise;
    }
};

module.exports = Template;
