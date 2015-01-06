/**
 * resource table of all assets
 * @type {{img: {}, js: {}, css: {}}}
 */
var resources = {
  img   : {},
  js    : {},
  css   : {},
  font  : {},
  svg   : {},
  swf   : {},
  htc   : {},
  pkgs  : {
    js  : {},
    css : {}
  }
};


var ResourceTable = {
  // add
  register: function(resource_description) {
    if (!resources[resource_description.type]) {
      resources[resource_description.type] = {};
    }
    resources[resource_description.type][resource_description.key] =
      resource_description.value;
  },
  // add
  registerPackage: function(pkg_description) {
    if (!resources.pkgs[pkg_description.type]) {
      resources.pkgs[pkg_description.type] = {};
    }
    resources.pkgs[pkg_description.type][pkg_description.key] =
      pkg_description.value;
  },
  // query
  getResource: function(type, id) {
    if (!resources[type]) {
      return null;
    } else if (!resources[type][id]) {
      return null;
    } else {
      return resources[type][id];
    }
  },
  /**
   *
   * @param type
   * @param id
   * @returns {*}
   */
  getPackageByPath: function(type, id) {
    if (!resources.pkgs[type]) {
      return null;
    } else if (!resources.pkgs[type][id]) {
      return null;
    } else {
      return resources.pkgs[type][id];
    }
  },
  // export
  getAllResources: function() {
    return resources;
  },
  // update
  updateResource: function(type, id, resource) {
    if (!resources[type]) {
      return false;
    } else if (!resources[type][id]) {
      return false;
    } else {
      resources[type][id] = resource;
      return true;
    }
  },
  // delete
  removeResource: function(type, id) {
    if (!resources[type]) {
      return false;
    } else if (!resources[type][id]) {
      return false;
    } else {
      delete resources[type][id];
      return true;
    }
  },
  // delete all
  clear: function() {
    resources = {
      img : {},
      js  : {},
      css : {},
      swf : {},
      svg : {},
      font: {},
      htc : {},
      pkgs  : {
        js  : {},
        css : {}
      }
    };
  }
};


module.exports = ResourceTable;
