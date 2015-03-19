"use strict";


var shell = require( "shelljs" );


function deleteSampleFiles(){
    shell.rm( "-rf", ".tmp/utf8" );
}

function prepareSampleFiles(){
    deleteSampleFiles();
    shell.cp( "-r", "./test/fixtures/utf8", ".tmp" );
}


module.exports = {
    prepareSampleFiles: prepareSampleFiles,
    deleteSampleFiles: deleteSampleFiles
};
