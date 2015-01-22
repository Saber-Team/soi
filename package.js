/**
 * @constructor
 * @param {Object} pkg
 */
function Package(pkg) {
  this.type = pkg.type;
  // starter file path;
  this.input = pkg.input;
  // current package contained all files
  this.files = pkg.files;
  // bundled dist file path;
  this.dist_file = pkg.dist_file;
}

module.exports = Package;