const fs = require('fs');
const path = require('path');
const template = require('babel-template');
const getComponent = template(fs.readFileSync(path.resolve(
  __dirname,
  './component-wrapper.js',
)) + '');

function getDefaultImport({ source, specifiers }) {
  const defaultImport = specifiers.find(
    i => i.type === 'ImportDefaultSpecifier',
  );
  const isNameless = !Boolean(specifiers.length);
  if ( !defaultImport && !isNameless ) return;
  const from = source.value;
  const isRelative = from.startsWith('./');
  const isCSS = from.endsWith('.css');
  const sharedInfo = {
    from,
    isRelative,
    isCSS,
  };
  if ( isNameless ) {
    return {
      type: 'nameless',
      info: sharedInfo,
    };
  }

  return {
    type: 'default',
    info: Object.assign(sharedInfo, {
      name: defaultImport.local.name,
    }),
  };
}

const PLUGIN_NAME = 'babel-auto-css-modules-classnames-and-lowercase-react';
const STYLE_IMPORT_NAME = 'style';


/**
 * Rename all relative default imports to capital letters
 * Visit all identifiers, if they match capitalize them
 */
const alwaysCapitalize = new Set([
  'choose', 'if', 'when', 'otherwise', 'for', 'with',
]);
const initialImportInfo = () => (
  {
    defaultImportOriginalNames: new Set(),
    hasStyle: false,
    default: [],
    nameless: [],
  }
);


function toCSSModulesClassName(literal, t) {
  return t.memberExpression(
    t.identifier(STYLE_IMPORT_NAME),
    literal,
    true,
  );
}


function transformVal(val, t) {
  if ( t.isStringLiteral(val) ) {
    return toCSSModulesClassName(val, t);
  }
  if ( t.isObjectExpression(val) ) {
    return t.objectExpression(val.properties.map(p => {
      return t.objectProperty(toCSSModulesClassName(p.key, t), p.value, true);
    }));
  }
  if ( t.isArrayExpression(val) ) {
    return t.arrayExpression(val.elements.map(e => transformVal(e, t)));
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.substring(1);
}


module.exports = function ({ types: t }) {

  const visitor = {
    // start of file
    Program: {
      enter(path) {
        this[PLUGIN_NAME] = initialImportInfo();
      },
    },
    /**
     * state is the second argument of visitors
     * ${state.file.opts.filename}
     */
    ImportDeclaration(path) {
      const context = this[PLUGIN_NAME];
      const defaultImport = getDefaultImport(path.node);
      if ( defaultImport ) {
        const { name } = defaultImport.info;
        if ( defaultImport.type === 'default' ) {
          const newName = capitalize(name);
          path.scope.rename(name, newName);
          context.defaultImportOriginalNames.add(name);
        }
        if (
          !context.hasStyle &&
          defaultImport.type == 'nameless' &&
          defaultImport.info.isCSS &&
          defaultImport.info.isRelative
        ) {
          defaultImport.info.name = STYLE_IMPORT_NAME;
          defaultImport.type = 'default';
          context.hasStyle = path.node.specifiers.push(
            t.importDefaultSpecifier(t.identifier(defaultImport.info.name)),
          );
        }
        context[defaultImport.type].push(defaultImport);
      }
    },

    JSXElement(path, { file }) {
      const context = this[PLUGIN_NAME];
      const { name } = path.node.openingElement.name;
      if (
        !context.defaultImportOriginalNames.has(name) &&
        !alwaysCapitalize.has(name)
      ) {
        return;
      }
      path.node.openingElement.name.name = capitalize(name);
      if ( path.node.closingElement ) {
        path.node.closingElement.name.name = capitalize(name);
      }
    },

    JSXAttribute(path, { opts } = {}) {
      const context = this[PLUGIN_NAME];
      const { name } = path.node.name;
      const replacement = opts[name];
      if ( !replacement ) return;
      let val = path.node.value;
      if ( !t.isStringLiteral(val) ) {
        val = val.expression;
        if ( val.type === 'SequenceExpression' ) {
          val = t.arrayExpression(val.expressions);
        }
      }
      path.node.name.name = replacement;
      if ( replacement === 'className' ) {
        if ( !context.hasStyle ) {
          throw Error(`!!! Please import css in before using classes !!!`);
        }
        path.node.value = t.jSXExpressionContainer(t.callExpression(
          t.identifier('classNames'),
          [transformVal(val, t)],
        ));
      }
    },

    ExportDefaultDeclaration(path, { file }) {
      const val = path.node.declaration;
      if ( !file.opts.filename.endsWith('.jsx') ||
        !t.isArrowFunctionExpression(val) ) {
        return;
      }
      path.insertBefore(t.variableDeclaration('const', [
          t.variableDeclarator(
            t.identifier('renderComponent'),
            val,
          ),
        ],
      ));
      path.node.declaration = getComponent({ COMPONENT_NAME: t.identifier('heyyyaa') });
    },
  };

  return {
    visitor,
    inherits: require('babel-plugin-syntax-jsx'),
  };
}
;
