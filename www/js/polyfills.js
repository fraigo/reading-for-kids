if (!String.prototype.replaceAll) {
    console.log('String.prototype.replaceAll polyfill');
    String.prototype.replaceAll = function(target, replacement) {
        return this.split(target).join(replacement);
    };
}