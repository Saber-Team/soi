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
        "overqualified-elements"      : 1,
        "bulletproof-font-face"       : 1,
        "regex-selectors"             : 1,
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
        "shorthand"                   : 1,
        "text-indent"                 : false,
        "unique-headings"             : false,
        "universal-selector"          : 1,
        "unqualified-attributes"      : 2,
        "zero-units"                  : 2
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