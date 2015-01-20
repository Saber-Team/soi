var soi_instance;

function next() {

}

function createInstance() {
  soi_instance = Object.create(null);
  soi_instance.use = function(plugin) {
    if (typeof plugin !== 'function') {
      throw 'soi plugin must be a function';
    }
    this.plugins.push({
      plugin: plugin,
      isUse: true
    });
    plugin.call(soi_instance, SOI_CONFIG, next);
    return soi_instance;
  };
  soi_instance.ENV = Object.create({
    config: SOI_CONFIG
  });
  soi_instance.plugins = [];
}

function soi() {
  if (soi_instance) {
    return soi_instance;
  }

  soi_instance = createInstance();
  return soi_instance;
}

module.exports = soi;