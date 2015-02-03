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
        "errors"                      : 1,
        "duplicate-background-images" : 1,
        "selector-max-approaching"    : 1,
        "font-sizes"                  : false,
        "floats"                      : false,
        "outline-none"                : false,
        "ids"                         : 1,
        "rules-count"                 : 1,
        "qualified-headings"          : 1,
        "selector-max"                : 1,
        "text-indent"                 : false,
        "unique-headings"             : false,
        "unqualified-attributes"      : 2
      }
    },
    js: {
      output: 'normal',
      files: [
        './js/*.js'
      ],
      rules: {

      }
    }
  }
});