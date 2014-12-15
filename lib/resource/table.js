/**
 * typedef
 * @type {{img: {}, js: {}, css: {}}}
 */
var resources = {
    img: {},
    js: {},
    css: {}
};


function ResourceTable() {

}


ResourceTable.register = function(resource_description) {
    if (!resources[resource_description.type]) {
        resources[resource_description.type] = {};
    }
    resources[resource_description.type][resource_description.key] =
        resource_description.value;
};


ResourceTable.clear = function() {
    resources = {
        img: {},
        js: {},
        css: {}
    };
};


module.exports = ResourceTable;
