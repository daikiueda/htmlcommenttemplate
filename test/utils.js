"use strict";


var shell = require( "shelljs" );


function deleteSampleFiles(){
    shell.rm( "-rf", ".tmp/sample_files" );
}

function prepareSampleFiles(){
    deleteSampleFiles();
    shell.cp( "-r", "./sample_files", ".tmp" );
}


module.exports = {
    prepareSampleFiles: prepareSampleFiles,
    deleteSampleFiles: deleteSampleFiles
};
