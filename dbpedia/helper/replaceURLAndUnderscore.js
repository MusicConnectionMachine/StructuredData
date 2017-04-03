module.exports = function (str) {
    //helper functions to replace all occurrences of a string
    function replaceAll(str, find, replace) {
        return str.replace(new RegExp(find, 'g'), replace);
    }

    str = str.replace("http://dbpedia.org/resource/", "");
    return replaceAll(str, "_", " ");

}
