/**
 * resource table of all assets
 * @type {{img: {}, js: {}, css: {}}}
 */
var resources = {
    img: {},
    js: {},
    css: {}
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
    // update
    updateResource: function(type, id, resource) {

    },
    // delete
    removeResource: function() {

    },
    // delete all
    clear: function() {
        resources = {
            img: {},
            js: {},
            css: {}
        };
    }
};


module.exports = ResourceTable;
