/** 
* ESLint: http://eslint.org/docs/user-guide/configuring
*/
module.exports =  {
  // sourceType: `script` or `module` for ES6 Modules
  // ECMA Versions:
  //    6 = 2015
  //    7 = 2016
  //    8 = 2017
  "parserOptions": {
    "sourceType": "script",
    "ecmaVersion": 7
  },

  // "env:" supplies predefined global variables
  "env": {
    "browser": true,
    "es6": true,
    "node": true,
    "mocha": true,
    "mongo": true
  },
  // our configuration extends the recommended base configuration
  "extends": "eslint:recommended",
  //ESLint rules: Severity Levels: off = 0 | warn = 1 | error = 2

  "rules": {
    "strict": ["error", "safe"],   	//prefer `'use-strict';` pragma
    "eqeqeq": [2, "allow-null"],
    "no-console": "off",          	//ignores `console.log()`
    "no-unused-vars": ["warn", { "args": "after-used", "ignoreRestSiblings": false }],
    "no-eval": "error",            	//disallows `eval()` usage
    "quotes": [2, "single", "avoid-escape"], //prefer single quotes over double quotes
    "indent": ["error", 2, {		// enforce 2 space indents (not tabs)
      "SwitchCase": 1				// clauses with 2 spaces with respect to switch statements
    }],
    "semi": ["error", "always"]    //enforce semi-colon usage
  }
}
