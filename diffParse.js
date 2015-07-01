'use strict';

var lineToIndex = function(diff, lineNumber) {
    var diffIndexes = diff.split('\n');
    var currentLine = 0;
    var currentIndex, currentIndexSubstr;

    for (var i = 0; i < diffIndexes.length; i++) {
        currentIndex = diffIndexes[i];
        currentIndexSubstr = currentIndex.substring(0, 1);

        if (currentIndexSubstr !== '-') {
            currentLine++;
        } else if (currentIndexSubstr === '@') {
            currentLine = currentIndex.split('+')[1].split(',')[0];
        } else if (currentLine === lineNumber) {
            if (currentIndexSubstr === '+') {
                return i + 1; //cause GitHub seems to start file indexes at 1 instead of 0. Oh Well.
            } else {
                return -1;
            }
        }
    }
    return -1;
};

module.exports.lineToIndex = lineToIndex;
