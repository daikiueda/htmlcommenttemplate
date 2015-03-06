"use strict";


var shell = require( "shelljs" );


function prepareSampleFiles(){
    deleteSampleFiles();
    shell.cp( "-r", "./sample_files", ".tmp" );
}

function deleteSampleFiles(){
    shell.rm( "-rf", ".tmp/sample_files" );
}


module.exports = {
    prepareSampleFiles: prepareSampleFiles,
    deleteSampleFiles: deleteSampleFiles
};
