/**
 * @fileoverview CONFIGURATION FILE
 *   Also used for the demo project
 * @author AceMood(zmike86)
 * @email zmike86@gmail.com
 */

soi.config.set({
  linter: {
    css: {
      output: 'normal', // `verbose` | `none`
      files: [
        './css/*.css'
      ],
      rules: {
        "duplicate-properties": 2,
        "empty-rules": 2
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