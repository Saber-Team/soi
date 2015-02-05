/**
 * @fileoverview CONFIGURATION FILE
 *   Also used for the demo project
 * @author AceMood(zmike86)
 * @email zmike86@gmail.com
 */

soi.config.extend({
  linter: {
    css: {
      output: 'normal', // `verbose` | `none`
      encoding: 'utf8',
      files: [
        './css/*.css'
      ],
      rules: {
        "adjoining-classes"           : 2,
        "known-properties"            : 2,
        "box-model"                   : false,
        "important"                   : 2,
        "errors"                      : 1,
        "selector-max-approaching"    : 1,
        "ids"                         : false,
        "rules-count"                 : 1,
        "selector-max"                : 1,
        "text-indent"                 : false,
        "unqualified-attributes"      : 1
      }
    },
    js: {
      output: 'normal',
      debug: true,
      encoding: 'utf8',
      // files array to be ignored
      ignores: [
        './js/ignore.js'
      ],
      //
      reporterOutput: './jshint_output',
      // all files to be linted
      files: [
        './js/*.js'
      ],
      // hint ruleset
      rules: {
        curly: false,
        eqeqeq: false
      }
    }
  }
});