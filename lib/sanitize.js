function contentSanitize (text) {
    text = text.replaceAll('<', '&lt;');
    text = text.replaceAll('>', '&gt;');

    return text;
}

module.exports = {
    contentSanitize
}