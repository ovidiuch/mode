var view = require('./view.js');
/**
 * Initialize mustache module with given helpers.
 *
 * The _prototype_ parameter becomes the prototype of
 * ScopeArguments.
 *
 * Any set of arguments that a Scope instance receives will
 * inherit the helper object the module was initialized with.
 *
 * Incidentally, both a helper can be a variable and a scope
 * argument a function. The mustache parser will interpret them
 * accordingly.
 *
 * Example:
 *
 *     // Define helpers (impractical samples)
 *     var helpers = {
 *       strong: function(text) {
 *         return '<strong>' + text + '</strong>';
 *       },
 *       italics: function(text) {
 *         return '<em>' + text + '</strong>';
 *       }
 *     };
 *     // Init mustache
 *     mustache.init(helpers);
 *
 * This module started with the minimalistic
 * [mustache templates](http://mustache.github.com/)
 * specification, but then gained a few extra features on top.
 * Even though classic mustache templates are fully compatible.
 *
 * @param {object} prototype A set of helpers
 * @see Scope
 * @see Scope#argument
 * @see ScopeArguments
 */
exports.init = function(prototype) {
  ScopeArguments.prototype = prototype;
};
/**
 * Parse mustache template.
 *
 * Example:
 *
 *     mustache.parse('My name is {{name}}', {name: 'Earl'});
 *
 * @param {string} body Template body
 * @param {object} args Template variables
 * @return {string} Processed body
 */
exports.parse = function(body, args) {
  return new Scope(args).process(body);
};
/**
 * A context scope, used for nesting sections.
 *
 * Every scope has its own set of arguments, which can come
 * from four different places and get overridden as follows:
 *
 *   - helpers
 *   - parent scopes
 *   - own arguments (first constructor parameter)
 *   - subject properties (read below)
 *
 * Besides the _args_ property, a Scope also has a _this_
 * property, which is the subject of the current scope.
 * It comes as the second parameter, and normally, only
 * present in child scopes.
 *
 * If the subject is an object, all its properties will be
 * poured into the scope argument pool.
 *
 * @constructor
 * @param {object} args
 * @param {object} subject
 * @private
 * @see ScopeArguments
 */
var Scope = function(args, subject) {
  this.args = new ScopeArguments(args);
  this.args.this = subject;
  if (typeof(subject) == 'object' && subject.length == undefined) {
    for (var i in subject) {
      this.args[i] = subject[i];
    }
  }
};
Scope.prototype = {
  /**
   * Process mustache template with internal arguments.
   *
   * @param {string} body Template body
   * @return {string} Processed body
   */
  process: function(body) {
    var that = this;
    for (var i in tags) {
      body = body.replace(tags[i].pattern, function() {
        return that[tags[i].callback].apply(that, arguments);
      });
    }
    return body;
  },
  /**
   * Process variable.
   *
   * Examples:
   *
   *     <!--safe, escaped var-->
   *     {{foo}}
   *     <!--raw, unescaped var-->
   *     {{{bar}}}
   *
   * @param {string} match RegExp match
   * @param {string} opening Tag opening
   * @param {string} name Subject name
   * @param {string} closing Tag closing
   * @return {string} Replaced value
   * @see #argument
   * @see #escape
   */
  variable: function(match, opening, name, closing) {
    var subject = this.argument(name);
    if (typeof(subject) == 'undefined') {
      return '';
    }
    return opening.length > 2 ? subject : this.escape(subject);
  },
  /**
   * Process beginning of section.
   *
   * @param {string} match RegExp match
   * @param {string} type Section modifier
   * @param {string} name Subject name
   * @param {string} body Rest of the template body
   * @return {string} Processed remaining body section
   * @see #section
   * @see #argument
   */
  start: function(match, type, name, body) {
    var that = this, pattern = new RegExp(
      '([\\S\\s]*?){{/(' + name.split(' ')[0] + ')}}([\\S\\s]*)$'
    );
    return body.replace(pattern, function(match, body, end, rest) {
      return that.section(body, name, type) + that.process(rest);
    });
  },
  /**
   * Process section contents.
   *
   * If the section subject is an Array, the section template
   * body will loop and apply for each of its elements.
   * Otherwise, it will just apply once for contents of the
   * subject; and only if it's not null, or viceversa, with
   * the _inverted_ modifier.
   *
   * Examples:
   *
   *     <!--normal section-->
   *     {{#users}}
   *       <li>{{name}}</li>
   *     {{/users}}
   *     <!--inverted section-->
   *     {{^users}}
   *       <li class="empty">There are no users.</li>
   *     {{/users}}
   *
   * @param {string} body Template section
   * @param {string} name Subject name
   * @param {string} type Section modifier
   * @return {string} Processed template section
   * @see #argument
   */
  section: function(body, name, type) {
    var subject = this.argument(name);
    if (type == '^') {
      subject = !subject;
    }
    if (!subject) {
      return '';
    }
    if (typeof(subject) != 'object' || subject.length == undefined) {
      return new Scope(this.args, subject).process(body);
    }
    var contents = '';
    for (var i in subject) {
      contents += new Scope(this.args, subject[i]).process(body);
    }
    return contents;
  },
  /**
   * Include partial templates.
   *
   * Partial tags are processed before other ones, in order
   * for the normal tags to be processed all at once.
   *
   * TODO: Make mustache module view-independent
   *
   * Example:
   *
   *     // Try to include /partial/header.mustache
   *     {{> header}}
   *
   * @param {string} match RegExp match
   * @param {string} name
   * @return {string} Raw contents
   * @see view.render
   */
  partial: function(match, name) {
    return view.render('/partial/' + name) || '';
  },
  /**
   * Process argument name.
   *
   * An argument can consist of a chain of nested properties.
   * If a property proves undefined in crossing the property
   * chain, the entire query will silently return a null value.
   *
   * A argument can be a also be a function, in which case
   * the argument becomes its returned value.
   *
   * Function arguments can also have parameters specified.
   * They are space-separated and have name references from
   * the current scope.
   *
   * If parameters are specified but the argument is not a
   * function, they are simply ignored.
   *
   * If a name of a specified parameter holds no actual
   * reference in the current scope, it will be sent with a
   * null value.
   *
   * Examples:
   *
   *     // Normal variable (might be function)
   *     {{foo}}
   *     // Nested properties
   *     {{foo.bar.length}}
   *     // With parameter (should be function)
   *     {{foo bar}}
   *
   * @param {string} name
   * @return {*} Processed argument
   * @see #params
   */
  argument: function(name) {
    // Split argument name by space, to extract any additional
    // parameters present
    var params = name.split(' ');
    // Extract the first of the parameters list and split it,
    // by dot, into hierarchical keys
    var keys = params.shift().split('.'), key;
    // Init subject as the args pool
    var subject = this.args, parent;
    // Consume key list, until it returns a null value
    while (key = keys.shift()) {
      // Set parent to current subject, before replacing it
      parent = subject;
      // Advance another level with the subject, but break
      // loop if the outcome is negative, because it would
      // prevent further iteration
      if (!(subject = subject[key])) {
        break;
      }
    }
    // Set subject to its returned value, if function
    if (typeof(subject) == 'function') {
      // Call function with parent subject as scope, and
      // with the processed list of parameters, if any
      subject = subject.apply(parent, this.params(params));
    }
    return subject;
  },
  /**
   * Fetch argument parameter values.
   *
   * @param {Array} list Parameter names
   * @return {Array} List with corresponding values
   * @see #argument
   */
  params: function(list) {
    var args = [], scope = this;
    list.forEach(function(param) {
      args.push(scope.argument(param));
    });
    return args;
  },
  /**
   * Html-escape text.
   *
   * @param {string} text
   * @return {string} Escaped text
   */
  escape: function(text) {
    var chars = {
      '&': 'amp',
      '<': 'lt',
      '>': 'gt',
      '"': 'quot',
      "'": '#039'
    };
    text = String(text);
    for (var i in chars) {
      text = text.replace(new RegExp(i, 'g'), '&' + chars[i] + ';');
    }
    return text;
  }
};
/**
 * A wrapper for Scope arguments.
 *
 * Its sole purpose is to share a common prototype of helpers
 * between scopes.
 *
 * This way a Scope does not need to pre-populate its arguments
 * from a pre-defined set of helpers. They're already there.
 *
 * @constructor
 * @param {object} args
 * @private
 */
var ScopeArguments = function(args) {
  for (var i in args) {
    this[i] = args[i];
  }
};
/**
 * Parsing rules.
 *
 * The order in which the tags are processed is the same as
 * the one they are defined in.
 *
 * @type {Array}
 * @private
 */
var tags = [
  // Partials
  {pattern: /{{> ([a-z0-9_\.-]+)}}/ig, callback: 'partial'},
  // Sections
  {pattern: /{{(#|\^)([a-z0-9_\.\ ]+)}}([\S\s]*)$/ig, callback: 'start'},
  // Variables
  {pattern: /({{{?)([a-z0-9_\.\ ]+)(}}}?)/ig, callback: 'variable'}
];