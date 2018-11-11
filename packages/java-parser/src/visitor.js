"use strict";
const JavaParser = require("./parser");

const parser = new JavaParser([]);
const BaseSQLVisitor = parser.getBaseCstVisitorConstructor();

const MismatchedTokenException = require("chevrotain").MismatchedTokenException;

class SQLToAstVisitor extends BaseSQLVisitor {
  constructor() {
    super();
    this.validateVisitor();
  }

  compilationUnit(ctx) {
    let annotations = [];
    if (ctx.annotation) {
      ctx.annotation.map(annotation =>
        annotations.push(this.visit(annotation))
      );
    }
    const pkg = this.visit(ctx.packageDeclaration);
    if (pkg != undefined && annotations.length > 0) {
      pkg.modifiers = annotations;
      annotations = [];
    }
    const imports = [];
    if (ctx.importDeclaration) {
      ctx.importDeclaration.map(importDeclaration =>
        imports.push(this.visit(importDeclaration))
      );
    }
    const types = [];
    if (ctx.typeDeclaration) {
      ctx.typeDeclaration.map(typeDeclaration =>
        types.push(this.visit(typeDeclaration))
      );
      if (types.length > 0 && annotations.length > 0) {
        for (let index = annotations.length - 1; index >= 0; index--) {
          types[0].modifiers.unshift(annotations[index]);
        }
      }
    }

    return {
      type: "COMPILATION_UNIT",
      package: pkg,
      imports: imports,
      types: types
    };
  }

  packageDeclaration(ctx) {
    const name = this.visit(ctx.qualifiedName);

    return {
      type: "PACKAGE_DECLARATION",
      modifiers: [],
      name: name
    };
  }

  importDeclaration(ctx) {
    const isStatic = !!ctx.Static;
    const name = this.visit(ctx.qualifiedName);
    const hasStar = !!ctx.Star;
    // If import has a star at the end,
    // Add it to the name list
    if (hasStar) {
      name.name.push({
        type: "IDENTIFIER",
        value: "*"
      });
    }

    return {
      type: "IMPORT_DECLARATION",
      static: isStatic,
      name: name
    };
  }

  typeDeclaration(ctx) {
    const modifiers = [];
    if (ctx.classOrInterfaceModifier) {
      ctx.classOrInterfaceModifier.map(modifier =>
        modifiers.push(this.visit(modifier))
      );
    }
    let declaration = undefined;
    if (ctx.classDeclaration) {
      declaration = this.visit(ctx.classDeclaration);
    } else if (ctx.enumDeclaration) {
      declaration = this.visit(ctx.enumDeclaration);
    } else if (ctx.interfaceDeclaration) {
      declaration = this.visit(ctx.interfaceDeclaration);
    } else if (ctx.annotationTypeDeclaration) {
      declaration = this.visit(ctx.annotationTypeDeclaration);
    }

    return {
      type: "TYPE_DECLARATION",
      modifiers: modifiers,
      declaration: declaration
    };
  }

  modifier(ctx) {
    if (ctx.classOrInterfaceModifier) {
      return this.visit(ctx.classOrInterfaceModifier);
    }

    let value = "";
    if (ctx.Native) {
      value = "native";
    } else if (ctx.Synchronized) {
      value = "synchronized";
    } else if (ctx.Transient) {
      value = "transient";
    } else if (ctx.Volatile) {
      value = "volatile";
    }

    return {
      type: "MODIFIER",
      value: value
    };
  }

  classOrInterfaceModifier(ctx) {
    if (ctx.annotation) {
      return this.visit(ctx.annotation);
    }

    let value = "";
    if (ctx.Public) {
      value = "public";
    } else if (ctx.Protected) {
      value = "protected";
    } else if (ctx.Private) {
      value = "private";
    } else if (ctx.Static) {
      value = "static";
    } else if (ctx.Abstract) {
      value = "abstract";
    } else if (ctx.Final) {
      value = "final";
    } else if (ctx.Strictfp) {
      value = "strictfp";
    }

    return {
      type: "MODIFIER",
      value: value
    };
  }

  variableModifier(ctx) {
    if (ctx.annotation) {
      return this.visit(ctx.annotation);
    }

    let value = "";
    if (ctx.Final) {
      value = "final";
    }

    return {
      type: "MODIFIER",
      value: value
    };
  }

  annotation(ctx) {
    const name = this.visit(ctx.qualifiedName);
    const hasBraces = !!ctx.LBrace;
    let values = [];
    if (hasBraces) {
      if (ctx.expression) {
        let expression = this.visit(ctx.expression);
        if (expression.type === "OPERATOR_EXPRESSION") {
          expression = {
            type: "ELEMENT_VALUE_PAIR",
            key: expression.left,
            value: expression.right
          };
        }
        values.push(expression);
      } else if (ctx.elementValueArrayInitializer) {
        values = [];
        const elementValueArrayInitializer = this.visit(
          ctx.elementValueArrayInitializer
        );
        values.push(elementValueArrayInitializer);
      }

      if (ctx.elementValuePair) {
        ctx.elementValuePair.map(elementValuePair =>
          values.push(this.visit(elementValuePair))
        );
      }
    }

    return {
      type: "ANNOTATION",
      name: name,
      hasBraces: hasBraces,
      values: values
    };
  }

  elementValuePairs(ctx) {
    const pairs = [];
    if (ctx.elementValuePair) {
      ctx.elementValuePair.map(elementValuePair =>
        pairs.push(this.visit(elementValuePair))
      );
    }

    return {
      type: "ELEMENT_VALUE_PAIRS",
      pairs: pairs
    };
  }

  elementValuePair(ctx) {
    const key = this.identifier(ctx.Identifier[0]);
    const value = this.visit(ctx.elementValue);

    return {
      type: "ELEMENT_VALUE_PAIR",
      key: key,
      value: value
    };
  }

  elementValue(ctx) {
    if (ctx.expression) {
      return this.visit(ctx.expression);
    }

    if (ctx.elementValueArrayInitializer) {
      return this.visit(ctx.elementValueArrayInitializer);
    }
  }

  elementValueArrayInitializer(ctx) {
    const elementValues = [];
    if (ctx.elementValue) {
      ctx.elementValue.map(elementValue =>
        elementValues.push(this.visit(elementValue))
      );
    }
    return {
      type: "ELEMENT_VALUE_ARRAY_INITIALIZER",
      values: elementValues
    };
  }

  classDeclaration(ctx) {
    const name = this.identifier(ctx.Identifier[0]);
    const body = this.visit(ctx.classBody);
    const typeParameters = this.visit(ctx.typeParameters);
    const ext = this.visit(ctx.typeType);
    const impl = this.visit(ctx.typeList);

    return {
      type: "CLASS_DECLARATION",
      name: name,
      typeParameters: typeParameters,
      extends: ext,
      implements: impl,
      body: body
    };
  }

  typeParameters(ctx) {
    const parameters = [];
    if (ctx.typeParameter) {
      ctx.typeParameter.map(typeParameter =>
        parameters.push(this.visit(typeParameter))
      );
    }

    return {
      type: "TYPE_PARAMETERS",
      list: parameters
    };
  }

  typeParameter(ctx) {
    const annotations = [];
    if (ctx.annotation) {
      ctx.annotation.map(annotation =>
        annotations.push(this.visit(annotation))
      );
    }
    const name = this.identifier(ctx.Identifier[0]);
    const typeBound = this.visit(ctx.typeBound);

    return {
      type: "TYPE_PARAMETER",
      modifiers: annotations,
      name: name,
      typeBound: typeBound
    };
  }

  typeBound(ctx) {
    const bounds = [];
    if (ctx.typeType) {
      ctx.typeType.map(typeType => bounds.push(this.visit(typeType)));
    }

    return {
      type: "TYPE_BOUND",
      list: bounds
    };
  }

  classBody(ctx) {
    const declarations = [];
    if (ctx.classBodyDeclaration) {
      ctx.classBodyDeclaration.map(classBodyDeclaration =>
        declarations.push(this.visit(classBodyDeclaration))
      );
    }

    return {
      type: "CLASS_BODY",
      declarations: declarations
    };
  }

  classBodyDeclaration(ctx) {
    if (ctx.commentStandalone) {
      return this.visit(ctx.commentStandalone);
    }

    if (ctx.block) {
      const isStatic = !!ctx.Static;
      const block = this.visit(ctx.block);

      return {
        type: "CLASS_BODY_BLOCK",
        static: isStatic,
        block: block
      };
    }

    if (ctx.memberDeclaration) {
      const modifiers = [];
      if (ctx.modifier) {
        ctx.modifier.map(modifier => modifiers.push(this.visit(modifier)));
      }
      if (ctx.Static) {
        modifiers.unshift({
          type: "MODIFIER",
          value: "static"
        });
      }
      const declaration = this.visit(ctx.memberDeclaration);
      const followedEmptyLine = declaration.followedEmptyLine || false;

      return {
        type: "CLASS_BODY_MEMBER_DECLARATION",
        modifiers: modifiers,
        declaration: declaration,
        followedEmptyLine: followedEmptyLine
      };
    }

    if (ctx.semiColon) {
      return {
        type: "SEMI_COLON_STATEMENT"
      };
    }
  }

  LineCommentStandalone(ctx) {
    return {
      type: "COMMENT_STANDALONE",
      value: ctx.image.replace(/[\n\r]*/g, "")
    };
  }

  JavaDocTraditionalCommentStandalone(ctx) {
    return {
      type: "COMMENT_STANDALONE",
      value: ctx.image.replace(/\*\/[\n\r]*/g, "*/")
    };
  }

  memberDeclaration(ctx) {
    if (ctx.interfaceDeclaration) {
      return this.visit(ctx.interfaceDeclaration);
    }
    if (ctx.annotationTypeDeclaration) {
      return this.visit(ctx.annotationTypeDeclaration);
    }
    if (ctx.classDeclaration) {
      return this.visit(ctx.classDeclaration);
    }
    if (ctx.enumDeclaration) {
      return this.visit(ctx.enumDeclaration);
    }
    if (ctx.genericMethodDeclarationOrGenericConstructorDeclaration) {
      return this.visit(
        ctx.genericMethodDeclarationOrGenericConstructorDeclaration
      );
    }
    if (ctx.fieldDeclarationOrMethodDeclarationOrConstructorDeclaration) {
      return this.visit(
        ctx.fieldDeclarationOrMethodDeclarationOrConstructorDeclaration
      );
    }
  }

  fieldDeclarationOrMethodDeclarationOrConstructorDeclaration(ctx) {
    if (ctx.Identifier) {
      if (ctx.Identifier[0].isConstructorDeclaration) {
        // constructorDeclaration
        const name = this.identifier(ctx.Identifier[0]);
        const parameters = this.visit(ctx.formalParameters);
        const throws = this.visit(ctx.qualifiedNameList);
        const body = this.visit(ctx.methodBody);

        return {
          type: "CONSTRUCTOR_DECLARATION",
          name: name,
          parameters: parameters,
          throws: throws,
          body: body
        };
      }

      // methodDeclaration
      // fieldDeclaration

      // typeType
      let typeType = undefined;
      if (ctx.Void) {
        typeType = {
          type: "VOID"
        };
      } else {
        const annotations = [];
        if (ctx.annotation) {
          ctx.annotation.map(annotation =>
            annotations.push(this.visit(annotation))
          );
        }
        const dimensions = [];
        if (ctx.LSquare) {
          ctx.LSquare.map(lSquare => {
            if (lSquare.isTypeType) {
              dimensions.push({
                type: "DIMENSION"
              });
            }
          });
        }

        let value = undefined;
        if (ctx.primitiveType) {
          value = this.visit(ctx.primitiveType);
          // if empty typeType return child
          if (annotations.length === 0 && dimensions.length === 0) {
            typeType = value;
          } else {
            typeType = {
              type: "TYPE_TYPE",
              modifiers: annotations,
              value: value,
              dimensions: dimensions
            };
          }
        } else if (ctx.Identifier) {
          const name = this.identifier(ctx.Identifier[0]);
          const typeArguments = this.visit(ctx.typeArguments);

          if (!typeArguments && !ctx.classOrInterfaceTypeElement) {
            typeType = name;
          } else {
            typeType = {
              type: "CLASS_OR_INTERFACE_TYPE_ELEMENT",
              name: name,
              typeArguments: typeArguments
            };
          }
          const elements = [typeType];

          if (ctx.classOrInterfaceTypeElement) {
            ctx.classOrInterfaceTypeElement.map(classOrInterfaceTypeElement =>
              elements.push(this.visit(classOrInterfaceTypeElement))
            );
          }

          if (elements.length === 1) {
            typeType = elements[0];
          } else {
            typeType = {
              type: "CLASS_OR_INTERFACE_TYPE",
              elements: elements
            };
          }

          if (annotations.length !== 0 || dimensions.length !== 0) {
            typeType = {
              type: "TYPE_TYPE",
              modifiers: annotations,
              value: typeType,
              dimensions: dimensions
            };
          }
        }
      }

      if (
        (ctx.primitiveType && ctx.primitiveType[0].isMethodDeclaration) ||
        (ctx.Void && ctx.Void[0].isMethodDeclaration) ||
        (ctx.Identifier && ctx.Identifier[0].isMethodDeclaration)
      ) {
        // methodDeclaration
        const name = this.identifier(
          ctx.Identifier[ctx.Identifier[0].isMethodDeclaration ? 1 : 0]
        );
        const parameters = this.visit(ctx.formalParameters);
        const dimensions = [];
        if (ctx.LSquare) {
          ctx.LSquare.map(lSquare => {
            if (!lSquare.isTypeType) {
              dimensions.push({
                type: "DIMENSION"
              });
            }
          });
        }
        const throws = this.visit(ctx.qualifiedNameList);
        const body = this.visit(ctx.methodBody);

        return {
          type: "METHOD_DECLARATION",
          typeType: typeType,
          name: name,
          parameters: parameters,
          dimensions: dimensions,
          throws: throws,
          body: body
        };
      }

      if (
        (ctx.primitiveType && ctx.primitiveType[0].isFieldDeclaration) ||
        (ctx.Identifier && ctx.Identifier[0].isFieldDeclaration)
      ) {
        const id = this.identifier(ctx.Identifier[ctx.primitiveType ? 0 : 1]);
        const dimensions = [];
        if (ctx.identifierDimension) {
          ctx.identifierDimension.map(() =>
            dimensions.push({
              type: "DIMENSION"
            })
          );
        }
        const variableDeclaratorId = {
          type: "VARIABLE_DECLARATOR_ID",
          id: id,
          dimensions: dimensions
        };

        const init = this.visit(ctx.variableInitializer);
        const variableDeclarator = {
          type: "VARIABLE_DECLARATOR",
          id: variableDeclaratorId,
          init: init
        };

        const declarators = [variableDeclarator];
        if (ctx.variableDeclarator) {
          ctx.variableDeclarator.map(variableDeclarator =>
            declarators.push(this.visit(variableDeclarator))
          );
        }

        const variableDeclarators = {
          type: "VARIABLE_DECLARATORS",
          list: declarators
        };

        const followedEmptyLine = this.visit(ctx.semiColon).followedEmptyLine;
        return {
          type: "FIELD_DECLARATION",
          typeType: typeType,
          variableDeclarators: variableDeclarators,
          followedEmptyLine: followedEmptyLine
        };
      }
    }
  }

  methodDeclaration(ctx) {
    const typeType = this.visit(ctx.typeTypeOrVoid);
    const name = this.identifier(ctx.Identifier[0]);
    const parameters = this.visit(ctx.formalParameters);
    const dimensions = [];
    if (ctx.LSquare) {
      ctx.LSquare.map(() =>
        dimensions.push({
          type: "DIMENSION"
        })
      );
    }
    const throws = this.visit(ctx.qualifiedNameList);
    const body = this.visit(ctx.methodBody);

    return {
      type: "METHOD_DECLARATION",
      typeType: typeType,
      name: name,
      parameters: parameters,
      dimensions: dimensions,
      throws: throws,
      body: body
    };
  }

  constructorDeclaration(ctx) {
    const name = this.identifier(ctx.Identifier[0]);
    const parameters = this.visit(ctx.formalParameters);
    const throws = this.visit(ctx.qualifiedNameList);
    const body = this.visit(ctx.methodBody);

    return {
      type: "CONSTRUCTOR_DECLARATION",
      name: name,
      parameters: parameters,
      throws: throws,
      body: body
    };
  }

  genericMethodDeclarationOrGenericConstructorDeclaration(ctx) {
    const typeParameters = this.visit(ctx.typeParameters);

    if (ctx.methodDeclaration) {
      const methodDeclaration = this.visit(ctx.methodDeclaration);

      return {
        type: "GENERIC_METHOD_DECLARATION",
        typeParameters: typeParameters,
        methodDeclaration: methodDeclaration
      };
    }

    if (ctx.constructorDeclaration) {
      const constructorDeclaration = this.visit(ctx.constructorDeclaration);

      return {
        type: "GENERIC_CONSTRUCTOR_DECLARATION",
        typeParameters: typeParameters,
        constructorDeclaration: constructorDeclaration
      };
    }
  }

  fieldDeclaration(ctx) {
    const typeType = this.visit(ctx.typeType);
    const variableDeclarators = this.visit(ctx.variableDeclarators);
    const followedEmptyLine = this.visit(ctx.semiColon).followedEmptyLine;

    return {
      type: "FIELD_DECLARATION",
      typeType: typeType,
      variableDeclarators: variableDeclarators,
      followedEmptyLine: followedEmptyLine
    };
  }

  methodBody(ctx) {
    if (ctx.block) {
      return this.visit(ctx.block);
    }
    if (ctx.semiColon) {
      return undefined;
    }
  }

  enumDeclaration(ctx) {
    const name = this.identifier(ctx.Identifier[0]);
    const impl = this.visit(ctx.typeList);
    const enumConstants = this.visit(ctx.enumConstants);
    const body = this.visit(ctx.enumBodyDeclarations);

    return {
      type: "ENUM_DECLARATION",
      name: name,
      implements: impl,
      enumConstants: enumConstants,
      body: body
    };
  }

  enumConstants(ctx) {
    const list = [];
    if (ctx.enumConstant) {
      ctx.enumConstant.map(enumConstant => list.push(this.visit(enumConstant)));
    }

    return {
      type: "ENUM_CONSTANTS",
      list: list
    };
  }

  enumConstant(ctx) {
    const modifiers = [];
    if (ctx.annotation) {
      ctx.annotation.map(modifier => modifiers.push(this.visit(modifier)));
    }
    const name = this.identifier(ctx.Identifier[0]);
    const args = this.visit(ctx.arguments);
    const body = this.visit(ctx.classBody);

    return {
      type: "ENUM_CONSTANT",
      modifiers: modifiers,
      name: name,
      arguments: args,
      body: body
    };
  }

  enumBodyDeclarations(ctx) {
    const declarations = [];
    if (ctx.classBodyDeclaration) {
      ctx.classBodyDeclaration.map(classBodyDeclaration =>
        declarations.push(this.visit(classBodyDeclaration))
      );
    }

    return {
      type: "ENUM_BODY_DECLARATIONS",
      declarations: declarations
    };
  }

  interfaceDeclaration(ctx) {
    const name = this.identifier(ctx.Identifier[0]);
    const typeParameters = this.visit(ctx.typeParameters);
    const typeList = this.visit(ctx.typeList);
    const body = this.visit(ctx.interfaceBody);

    return {
      type: "INTERFACE_DECLARATION",
      name: name,
      typeParameters: typeParameters,
      extends: typeList,
      body: body
    };
  }

  interfaceBody(ctx) {
    const declarations = [];
    if (ctx.interfaceBodyDeclaration) {
      ctx.interfaceBodyDeclaration.map(interfaceBodyDeclaration =>
        declarations.push(this.visit(interfaceBodyDeclaration))
      );
    }

    return {
      type: "INTERFACE_BODY",
      declarations: declarations
    };
  }

  interfaceBodyDeclaration(ctx) {
    if (ctx.commentStandalone) {
      return this.visit(ctx.commentStandalone);
    }

    const modifiers = [];
    if (ctx.modifier) {
      ctx.modifier.map(modifier => modifiers.push(this.visit(modifier)));
    }
    const declaration = this.visit(ctx.interfaceMemberDeclaration);
    const followedEmptyLine = declaration.followedEmptyLine || false;

    return {
      type: "INTERFACE_BODY_DECLARATION",
      modifiers: modifiers,
      declaration: declaration,
      followedEmptyLine: followedEmptyLine
    };
  }

  interfaceMemberDeclaration(ctx) {
    if (ctx.constantDeclarationOrInterfaceMethodDeclaration) {
      return this.visit(ctx.constantDeclarationOrInterfaceMethodDeclaration);
    } else if (ctx.interfaceDeclaration) {
      return this.visit(ctx.interfaceDeclaration);
    } else if (ctx.classDeclaration) {
      return this.visit(ctx.classDeclaration);
    } else if (ctx.enumDeclaration) {
      return this.visit(ctx.enumDeclaration);
    }
  }

  constantDeclarationOrInterfaceMethodDeclaration(ctx) {
    if (ctx.semiColon) {
      // constantDeclaration
      const typeType = this.visit(ctx.typeType);
      const declarators = [];
      if (ctx.constantDeclarator) {
        ctx.constantDeclarator.map(constantDeclarator =>
          declarators.push(this.visit(constantDeclarator))
        );
      }

      const followedEmptyLine = this.visit(ctx.semiColon).followedEmptyLine;
      return {
        type: "CONSTANT_DECLARATION",
        typeType: typeType,
        declarators: declarators,
        followedEmptyLine: followedEmptyLine
      };
    }

    if (ctx.methodBody) {
      // interfaceMethodDeclaration
      const modifiers = [];
      if (ctx.interfaceMethodModifier) {
        ctx.interfaceMethodModifier.map(modifier =>
          modifiers.push(this.visit(modifier))
        );
      }
      const typeParameters = this.visit(ctx.typeParameters);
      let typeType = undefined;
      if (ctx.typeType) {
        typeType = this.visit(ctx.typeType);
      } else if (ctx.Void) {
        typeType = {
          type: "VOID"
        };
      }
      const name = this.identifier(ctx.Identifier[0]);
      const parameters = this.visit(ctx.formalParameters);
      const dimensions = [];
      if (ctx.LSquare) {
        ctx.LSquare.map(() =>
          dimensions.push({
            type: "DIMENSION"
          })
        );
      }
      const throws = this.visit(ctx.qualifiedNameList);
      const body = this.visit(ctx.methodBody);

      return {
        type: "INTERFACE_METHOD_DECLARATION",
        modifiers: modifiers,
        typeParameters: typeParameters,
        typeType: typeType,
        name: name,
        parameters: parameters,
        dimensions: dimensions,
        throws: throws,
        body: body
      };
    }
  }

  constantDeclaration(ctx) {
    const typeType = this.visit(ctx.typeType);
    const declarators = [];
    if (ctx.constantDeclarator) {
      ctx.constantDeclarator.map(constantDeclarator =>
        declarators.push(this.visit(constantDeclarator))
      );
    }

    const followedEmptyLine = this.visit(ctx.semiColon).followedEmptyLine;
    return {
      type: "CONSTANT_DECLARATION",
      typeType: typeType,
      declarators: declarators,
      followedEmptyLine: followedEmptyLine
    };
  }

  constantDeclarator(ctx) {
    const name = this.identifier(ctx.Identifier[0]);
    const dimensions = [];
    if (ctx.LSquare) {
      ctx.LSquare.map(() =>
        dimensions.push({
          type: "DIMENSION"
        })
      );
    }
    const init = this.visit(ctx.variableInitializer);

    return {
      type: "CONSTANT_DECLARATOR",
      name: name,
      dimensions: dimensions,
      init: init
    };
  }

  interfaceMethodDeclaration(ctx) {
    const modifiers = [];
    if (ctx.interfaceMethodModifier) {
      ctx.interfaceMethodModifier.map(modifier =>
        modifiers.push(this.visit(modifier))
      );
    }
    const typeParameters = this.visit(ctx.typeParameters);
    const typeType = this.visit(ctx.typeTypeOrVoid);
    const name = this.identifier(ctx.Identifier[0]);
    const parameters = this.visit(ctx.formalParameters);
    const dimensions = [];
    if (ctx.LSquare) {
      ctx.LSquare.map(() =>
        dimensions.push({
          type: "DIMENSION"
        })
      );
    }
    const throws = this.visit(ctx.qualifiedNameList);
    const body = this.visit(ctx.methodBody);

    return {
      type: "INTERFACE_METHOD_DECLARATION",
      modifiers: modifiers,
      typeParameters: typeParameters,
      typeType: typeType,
      name: name,
      parameters: parameters,
      dimensions: dimensions,
      throws: throws,
      body: body
    };
  }

  interfaceMethodModifier(ctx) {
    if (ctx.annotation) {
      return this.visit(ctx.annotation);
    }

    let value = "";
    if (ctx.Public) {
      value = "public";
    } else if (ctx.Abstract) {
      value = "abstract";
    } else if (ctx.Default) {
      value = "default";
    } else if (ctx.Static) {
      value = "static";
    } else if (ctx.Strictfp) {
      value = "strictfp";
    }

    return {
      type: "MODIFIER",
      value: value
    };
  }

  variableDeclarators(ctx) {
    const list = [];
    if (ctx.variableDeclarator) {
      ctx.variableDeclarator.map(variableDeclarator =>
        list.push(this.visit(variableDeclarator))
      );
    }

    return {
      type: "VARIABLE_DECLARATORS",
      list: list
    };
  }

  variableDeclarator(ctx) {
    const id = this.visit(ctx.variableDeclaratorId);
    const init = this.visit(ctx.variableInitializer);

    return {
      type: "VARIABLE_DECLARATOR",
      id: id,
      init: init
    };
  }

  variableDeclaratorId(ctx) {
    const id = this.identifier(ctx.Identifier[0]);
    const dimensions = [];
    if (ctx.LSquare) {
      ctx.LSquare.map(() =>
        dimensions.push({
          type: "DIMENSION"
        })
      );
    }
    return {
      type: "VARIABLE_DECLARATOR_ID",
      id: id,
      dimensions: dimensions
    };
  }

  variableInitializer(ctx) {
    if (ctx.Questionmark) {
      const condition = this.visit(ctx.expression[0]);
      const ifExpression = this.visit(ctx.expression[1]);
      const elseExpression = this.visit(ctx.expression[2]);

      return {
        type: "IF_ELSE_EXPRESSION",
        condition: condition,
        if: ifExpression,
        else: elseExpression
      };
    }

    if (ctx.expression) {
      return this.visit(ctx.expression);
    }

    if (ctx.arrayInitializer) {
      return this.visit(ctx.arrayInitializer);
    }
  }

  arrayInitializer(ctx) {
    const variableInitializers = [];
    if (ctx.variableInitializer) {
      ctx.variableInitializer.map(variableInitializer =>
        variableInitializers.push(this.visit(variableInitializer))
      );
    }

    return {
      type: "ARRAY_INITIALIZER",
      variableInitializers: variableInitializers
    };
  }

  annotationTypeDeclaration(ctx) {
    const name = this.identifier(ctx.Identifier[0]);
    const body = this.visit(ctx.annotationTypeBody);

    return {
      type: "ANNOTATION_TYPE_DECLARATION",
      name: name,
      body: body
    };
  }

  annotationTypeBody(ctx) {
    const declarations = [];
    if (ctx.annotationTypeElementDeclaration) {
      ctx.annotationTypeElementDeclaration.map(
        annotationTypeElementDeclaration =>
          declarations.push(this.visit(annotationTypeElementDeclaration))
      );
    }

    return {
      type: "ANNOTATION_TYPE_BODY",
      declarations: declarations
    };
  }

  annotationTypeElementDeclaration(ctx) {
    const modifiers = [];
    if (ctx.modifier) {
      ctx.modifier.map(modifier => modifiers.push(this.visit(modifier)));
    }
    const declaration = this.visit(ctx.annotationTypeElementRest);

    return {
      type: "ANNOTATION_TYPE_ELEMENT_DECLARATION",
      modifiers: modifiers,
      declaration: declaration
    };
  }

  annotationTypeElementRest(ctx) {
    if (ctx.classDeclaration) {
      return this.visit(ctx.classDeclaration);
    } else if (ctx.enumDeclaration) {
      return this.visit(ctx.enumDeclaration);
    } else if (ctx.interfaceDeclaration) {
      return this.visit(ctx.interfaceDeclaration);
    } else if (ctx.annotationTypeDeclaration) {
      return this.visit(ctx.annotationTypeDeclaration);
    }

    const typeType = this.visit(ctx.typeType);
    const name = this.visit(ctx.annotationMethodRestOrConstantRest);

    return {
      type: "ANNOTATION_TYPE_ELEMENT_REST",
      typeType: typeType,
      name: name
    };
  }

  annotationMethodRestOrConstantRest(ctx) {
    if (ctx.annotationMethodRest) {
      return this.visit(ctx.annotationMethodRest);
    }

    if (ctx.annotationConstantRest) {
      return this.visit(ctx.annotationConstantRest);
    }
  }

  annotationMethodRest(ctx) {
    const name = this.identifier(ctx.Identifier[0]);
    const defaultValue = this.visit(ctx.defaultValue);

    return {
      type: "ANNOTATION_METHOD_REST",
      name: name,
      defaultValue: defaultValue
    };
  }

  annotationConstantRest(ctx) {
    if (ctx.variableDeclarators) {
      return this.visit(ctx.variableDeclarators);
    }
  }

  defaultValue(ctx) {
    const value = this.visit(ctx.elementValue);

    return {
      type: "DEFAULT_VALUE",
      value: value
    };
  }

  typeList(ctx) {
    const list = [];
    if (ctx.typeType) {
      ctx.typeType.map(typeType => list.push(this.visit(typeType)));
    }

    return {
      type: "TYPE_LIST",
      list: list
    };
  }

  typeType(ctx) {
    const annotations = [];
    if (ctx.annotation) {
      ctx.annotation.map(annotation =>
        annotations.push(this.visit(annotation))
      );
    }
    const dimensions = [];
    if (ctx.LSquare) {
      ctx.LSquare.map(() =>
        dimensions.push({
          type: "DIMENSION"
        })
      );
    }

    let value = undefined;
    if (ctx.primitiveType) {
      value = this.visit(ctx.primitiveType);
      // if empty typeType return child
      if (annotations.length === 0 && dimensions.length === 0) {
        return value;
      }
    } else if (ctx.classOrInterfaceType) {
      value = this.visit(ctx.classOrInterfaceType);
      // if empty typeType return child
      if (annotations.length === 0 && dimensions.length === 0) {
        return value;
      }
    }

    if (!value) {
      return annotations[0];
    }

    return {
      type: "TYPE_TYPE",
      modifiers: annotations,
      value: value,
      dimensions: dimensions
    };
  }

  typeTypeOrVoid(ctx) {
    if (ctx.typeType) {
      return this.visit(ctx.typeType);
    } else if (ctx.Void) {
      return { type: "VOID" };
    }
  }

  classOrInterfaceType(ctx) {
    const elements = [];
    if (ctx.classOrInterfaceTypeElement) {
      ctx.classOrInterfaceTypeElement.map(classOrInterfaceTypeElement =>
        elements.push(this.visit(classOrInterfaceTypeElement))
      );
    }

    if (elements.length === 1) {
      return elements[0];
    }

    return {
      type: "CLASS_OR_INTERFACE_TYPE",
      elements: elements
    };
  }

  classOrInterfaceTypeElement(ctx) {
    const name = this.identifier(ctx.Identifier[0]);
    const typeArguments = this.visit(ctx.typeArguments);

    if (!typeArguments) {
      return name;
    }

    return {
      type: "CLASS_OR_INTERFACE_TYPE_ELEMENT",
      name: name,
      typeArguments: typeArguments
    };
  }

  typeArguments(ctx) {
    const args = [];
    if (ctx.typeArgument) {
      ctx.typeArgument.map(typeArgument => args.push(this.visit(typeArgument)));
    }

    return {
      type: "TYPE_ARGUMENTS",
      value: {
        type: "TYPE_LIST",
        list: args
      }
    };
  }

  typeArgumentsOrOperatorExpressionRest(ctx) {
    if (ctx.This) {
      return {
        type: "OPERATOR_EXPRESSION_REST",
        operator: {
          type: "OPERATOR",
          operator: "<"
        },
        expression: {
          type: "THIS"
        }
      };
    }

    if (ctx.Super) {
      return {
        type: "OPERATOR_EXPRESSION_REST",
        operator: {
          type: "OPERATOR",
          operator: "<"
        },
        expression: {
          type: "SUPER"
        }
      };
    }

    if (ctx.typeArgument) {
      let typeArguments = this.visit(ctx.typeArgument);
      if (ctx.Less) {
        // found typeArguments
        const args = [];
        if (ctx.typeArgument) {
          ctx.typeArgument.map(typeArgument =>
            args.push(this.visit(typeArgument))
          );
        }

        if (ctx.Greater) {
          // found typeArguments
          typeArguments = {
            type: "TYPE_LIST",
            list: args
          };
        } else {
          // found operator expression with operator "<"

          let right = args[0];
          if (ctx.LBrace) {
            let parameters = undefined;
            if (ctx.expressionList) {
              parameters = this.visit(ctx.expressionList);
            }

            const dimensions = [];
            if (ctx.dimension) {
              ctx.dimension.map(dimension =>
                dimensions.push(this.visit(dimension))
              );
            }

            if (right.argument.type === "IDENTIFIER") {
              right = {
                type: "METHOD_INVOCATION",
                name: right.argument,
                parameters: parameters,
                dimensions: dimensions
              };
            } else if (right.argument.type === "CLASS_OR_INTERFACE_TYPE") {
              let first = undefined;
              let temp = undefined;
              for (let i = 0; i < right.argument.elements.length; i++) {
                if (i !== right.argument.elements.length - 1) {
                  const current = {
                    type: "QUALIFIED_EXPRESSION",
                    expression: right.argument.elements[i],
                    rest: undefined
                  };
                  if (i === 0) {
                    first = current;
                    temp = current;
                  } else {
                    temp.rest = current;
                    temp = current;
                  }
                } else {
                  temp.rest = {
                    type: "METHOD_INVOCATION",
                    name: right.argument.elements[i],
                    parameters: parameters,
                    dimensions: dimensions
                  };
                }
              }
              right = first;
            }
          }

          return {
            type: "OPERATOR_EXPRESSION_REST",
            operator: {
              type: "OPERATOR",
              operator: "<"
            },
            expression: right
          };
        }
      }

      return {
        type: "TYPE_ARGUMENTS",
        value: typeArguments
      };
    }

    if (ctx.literal) {
      const literal = this.visit(ctx.literal);
      return {
        type: "OPERATOR_EXPRESSION_REST",
        operator: {
          type: "OPERATOR",
          operator: "<"
        },
        expression: literal
      };
    }

    if (ctx.expression) {
      const expression = this.visit(ctx.expression);
      return {
        type: "OPERATOR_EXPRESSION_REST",
        operator: {
          type: "OPERATOR",
          operator: "<"
        },
        expression: {
          type: "PAR_EXPRESSION",
          expression: expression
        }
      };
    }
  }

  typeArgument(ctx) {
    const isQuestionmark = !!ctx.Questionmark;

    let argument = undefined;
    if (isQuestionmark) {
      argument = { type: "QUESTIONMARK" };
    } else {
      argument = this.visit(ctx.typeType[0]);
    }

    let spr = undefined;
    let ext = undefined;
    if (ctx.Super) {
      if (isQuestionmark) {
        spr = this.visit(ctx.typeType[0]);
      } else {
        spr = this.visit(ctx.typeType[1]);
      }
    } else if (ctx.Extends) {
      if (isQuestionmark) {
        ext = this.visit(ctx.typeType[0]);
      } else {
        ext = this.visit(ctx.typeType[1]);
      }
    }

    return {
      type: "TYPE_ARGUMENT",
      argument: argument,
      super: spr,
      extends: ext
    };
  }

  qualifiedNameList(ctx) {
    const list = [];
    if (ctx.qualifiedName) {
      ctx.qualifiedName.map(qualifiedName =>
        list.push(this.visit(qualifiedName))
      );
    }

    return {
      type: "QUALIFIED_NAME_LIST",
      list: list
    };
  }

  identifiers(ctx) {
    const identifiers = this.visit(ctx.identifierList);

    return {
      type: "IDENTIFIERS",
      identifiers: identifiers
    };
  }

  identifierList(ctx) {
    const identifiers = [];
    if (ctx.Identifier) {
      ctx.Identifier.map(identifierToken =>
        identifiers.push(identifierToken.image)
      );
    }

    return {
      type: "IDENTIFIER_LIST",
      list: identifiers
    };
  }

  formalParameters(ctx) {
    const parameters = this.visit(ctx.formalParameterList);

    return {
      type: "FORMAL_PARAMETERS",
      parameters: parameters ? parameters : []
    };
  }

  formalParameterList(ctx) {
    const formalParameters = [];
    if (ctx.formalParameter) {
      ctx.formalParameter.map(formalParameter =>
        formalParameters.push(this.visit(formalParameter))
      );
    }

    for (let i = 0; i < formalParameters.length; i++) {
      if (formalParameters[i].dotDotDot && i + 1 < formalParameters.length) {
        throw new MismatchedTokenException(
          'Only last parameter is allowed with "..."',
          undefined
        );
      }
    }

    return formalParameters;
  }

  formalParameter(ctx) {
    const modifiers = [];
    if (ctx.variableModifier) {
      ctx.variableModifier.map(modifier =>
        modifiers.push(this.visit(modifier))
      );
    }
    const typeType = this.visit(ctx.typeType);
    const id = this.visit(ctx.variableDeclaratorId);
    const isDotDotDot = !!ctx.DotDotDot;

    return {
      type: "FORMAL_PARAMETER",
      modifiers: modifiers,
      typeType: typeType,
      id: id,
      dotDotDot: isDotDotDot
    };
  }

  block(ctx) {
    const blockStatements = [];
    if (ctx.blockStatement) {
      ctx.blockStatement.map(blockStatement =>
        blockStatements.push(this.visit(blockStatement))
      );
    }

    return {
      type: "BLOCK",
      statements: blockStatements
    };
  }

  blockStatement(ctx) {
    if (ctx.commentStandalone) {
      return this.visit(ctx.commentStandalone);
    }

    if (ctx.expression) {
      let expression = this.visit(ctx.expression);

      if (expression.type === "PRIMITIVE_TYPE") {
        // if expression is only a primitiveType nothing else is allowed with it
        if (ctx.Colon) {
          throw new MismatchedTokenException(
            "Primitive type with colon found",
            undefined
          );
        }
        if (ctx.typeArguments || ctx.Dot) {
          throw new MismatchedTokenException(
            "Primitive type with type arguments or dot found",
            undefined
          );
        }
      }

      if (expression.type !== "IDENTIFIER") {
        // if expression is only a primitiveType nothing else is allowed with it
        if (ctx.Colon) {
          throw new MismatchedTokenException(
            "Only identifier is allowed with colon",
            undefined
          );
        }
        if (ctx.typeArguments || ctx.Dot) {
          throw new MismatchedTokenException(
            "Only identifier is allowed with type arguments or dot",
            undefined
          );
        }
      }

      // identifier statement
      if (expression.type === "IDENTIFIER" && ctx.Colon) {
        if (ctx.classOrInterfaceModifier) {
          throw new MismatchedTokenException(
            "Identifier statement is not allowed to have annotations or modifiers.",
            undefined
          );
        }
        if (ctx.LSquare || ctx.variableDeclarators) {
          throw new MismatchedTokenException(
            "Identifier statement is not allowed to have squares or variable declarators",
            undefined
          );
        }
        const statement = this.visit(ctx.statement);

        return {
          type: "IDENTIFIER_STATEMENT",
          identifier: expression,
          statement: statement
        };
      }

      const followedEmptyLine = this.visit(ctx.semiColon).followedEmptyLine;
      if (
        expression.type === "IDENTIFIER" ||
        expression.type === "PRIMITIVE_TYPE"
      ) {
        // localVariableDeclaration
        const modifiers = [];
        if (ctx.classOrInterfaceModifier) {
          ctx.classOrInterfaceModifier.map(modifierRule => {
            const modifier = this.visit(modifierRule);
            if (
              modifier.type === "MODIFIER" &&
              (modifier.value === "public" ||
                modifier.value === "protected" ||
                modifier.value === "private" ||
                modifier.value === "static" ||
                modifier.value === "abstract" ||
                modifier.value === "strictfp")
            ) {
              throw new MismatchedTokenException(
                "Locale variable declaration can't have a public, protected, private, static, abstract or strictfp modifier.",
                undefined
              );
            }
            modifiers.push(modifier);
          });
        }

        const declarators = this.visit(ctx.variableDeclarators);

        return {
          type: "EXPRESSION_STATEMENT",
          expression: {
            type: "LOCAL_VARIABLE_DECLARATION",
            modifiers: modifiers,
            typeType: expression,
            declarators: declarators
          },
          followedEmptyLine: followedEmptyLine
        };
      }

      if (expression.type === "IDENTIFIER" || ctx.semiColon) {
        // expressionStatement
        if (ctx.variableDeclarators) {
          const variableDeclarators = this.visit(ctx.variableDeclarators);

          if (ctx.classOrInterfaceModifier || ctx.LSquare) {
            const annotations = [];
            if (ctx.classOrInterfaceModifier) {
              ctx.classOrInterfaceModifier.map(classOrInterfaceModifier =>
                annotations.push(this.visit(classOrInterfaceModifier))
              );
            }
            const dimensions = [];
            if (ctx.LSquare) {
              ctx.LSquare.map(() =>
                dimensions.push({
                  type: "DIMENSION"
                })
              );
            }
            expression = {
              type: "TYPE_TYPE",
              modifiers: annotations,
              value: expression,
              dimensions: dimensions
            };
          }

          const followedEmptyLine = this.visit(ctx.semiColon).followedEmptyLine;
          return {
            type: "FIELD_DECLARATION",
            typeType: expression,
            variableDeclarators: variableDeclarators,
            followedEmptyLine: followedEmptyLine
          };
        }
        return {
          type: "EXPRESSION_STATEMENT",
          expression: expression,
          followedEmptyLine: followedEmptyLine
        };
      }
    }

    if (ctx.classDeclaration || ctx.interfaceDeclaration) {
      // localTypeDeclaration
      const modifiers = [];
      if (ctx.classOrInterfaceModifier) {
        ctx.classOrInterfaceModifier.map(modifier =>
          modifiers.push(this.visit(modifier))
        );
      }
      let declaration = undefined;
      if (ctx.classDeclaration) {
        declaration = this.visit(ctx.classDeclaration);
      }
      if (ctx.interfaceDeclaration) {
        declaration = this.visit(ctx.interfaceDeclaration);
      }

      return {
        type: "LOCAL_TYPE_DECLARATION",
        modifiers: modifiers,
        declaration: declaration
      };
    }

    if (ctx.statementWithStartingToken) {
      return this.visit(ctx.statementWithStartingToken);
    }
  }

  statement(ctx) {
    if (ctx.statementWithStartingToken) {
      return this.visit(ctx.statementWithStartingToken);
    }

    if (ctx.identifierStatement) {
      return this.visit(ctx.identifierStatement);
    }

    if (ctx.expressionStatement) {
      return this.visit(ctx.expressionStatement);
    }
  }

  statementWithStartingToken(ctx) {
    if (ctx.block) {
      return this.visit(ctx.block);
    }

    if (ctx.assertStatement) {
      return this.visit(ctx.assertStatement);
    }

    if (ctx.ifStatement) {
      return this.visit(ctx.ifStatement);
    }

    if (ctx.whileStatement) {
      return this.visit(ctx.whileStatement);
    }

    if (ctx.forStatement) {
      return this.visit(ctx.forStatement);
    }

    if (ctx.doWhileStatement) {
      return this.visit(ctx.doWhileStatement);
    }

    if (ctx.tryStatement) {
      return this.visit(ctx.tryStatement);
    }

    if (ctx.switchStatement) {
      return this.visit(ctx.switchStatement);
    }

    if (ctx.synchronizedStatement) {
      return this.visit(ctx.synchronizedStatement);
    }

    if (ctx.returnStatement) {
      return this.visit(ctx.returnStatement);
    }

    if (ctx.throwStatement) {
      return this.visit(ctx.throwStatement);
    }

    if (ctx.breakStatement) {
      return this.visit(ctx.breakStatement);
    }

    if (ctx.continueStatement) {
      return this.visit(ctx.continueStatement);
    }

    if (ctx.semiColonStatement) {
      return this.visit(ctx.semiColonStatement);
    }
  }

  assertStatement(ctx) {
    const booleanExpression = this.visit(ctx.expression[0]);
    let valueExpression = undefined;
    if (ctx.expression.length > 1) {
      valueExpression = this.visit(ctx.expression[1]);
    }

    return {
      type: "ASSERT_STATEMENT",
      booleanExpression: booleanExpression,
      valueExpression: valueExpression
    };
  }

  ifStatement(ctx) {
    const condition = this.visit(ctx.expression);
    const body = this.visit(ctx.statement[0]);
    let elseStatement = undefined;
    if (ctx.statement.length > 1) {
      elseStatement = this.visit(ctx.statement[1]);
    }

    return {
      type: "IF_STATEMENT",
      condition: condition,
      body: body,
      else: elseStatement
    };
  }

  whileStatement(ctx) {
    const condition = this.visit(ctx.expression);
    const body = this.visit(ctx.statement);

    return {
      type: "WHILE_STATEMENT",
      condition: condition,
      body: body
    };
  }

  doWhileStatement(ctx) {
    const body = this.visit(ctx.statement);
    const condition = this.visit(ctx.expression);

    return {
      type: "DO_WHILE_STATEMENT",
      body: body,
      condition: condition
    };
  }

  tryStatement(ctx) {
    const resourceSpecification = this.visit(ctx.resourceSpecification);
    const body = this.visit(ctx.block);
    const catchClauses = [];
    if (ctx.catchClause) {
      ctx.catchClause.map(catchClause =>
        catchClauses.push(this.visit(catchClause))
      );
    }
    const finallyBlock = this.visit(ctx.finallyBlock);

    return {
      type: "TRY_STATEMENT",
      resourceSpecification: resourceSpecification,
      body: body,
      catchClauses: catchClauses,
      finally: finallyBlock
    };
  }

  switchStatement(ctx) {
    const condition = this.visit(ctx.expression);
    const statementGroups = [];
    if (ctx.switchBlockStatementGroup) {
      ctx.switchBlockStatementGroup.map(switchBlockStatementGroup =>
        statementGroups.push(this.visit(switchBlockStatementGroup))
      );
    }

    return {
      type: "SWITCH_STATEMENT",
      condition: condition,
      statementGroups: statementGroups
    };
  }

  synchronizedStatement(ctx) {
    const condition = this.visit(ctx.expression);
    const body = this.visit(ctx.block);

    return {
      type: "SYNCHRONIZED_STATEMENT",
      condition: condition,
      body: body
    };
  }

  returnStatement(ctx) {
    const expression = this.visit(ctx.expression);

    return {
      type: "RETURN_STATEMENT",
      expression: expression
    };
  }

  throwStatement(ctx) {
    const expression = this.visit(ctx.expression);

    return {
      type: "THROW_STATEMENT",
      expression: expression
    };
  }

  breakStatement(ctx) {
    let identifier = undefined;
    if (ctx.Identifier) {
      identifier = this.identifier(ctx.Identifier[0]);
    }

    return {
      type: "BREAK_STATEMENT",
      identifier: identifier
    };
  }

  continueStatement(ctx) {
    let identifier = undefined;
    if (ctx.Identifier) {
      identifier = this.identifier(ctx.Identifier[0]);
    }

    return {
      type: "CONTINUE_STATEMENT",
      identifier: identifier
    };
  }

  semiColonStatement() {
    return {
      type: "SEMI_COLON_STATEMENT"
    };
  }

  expressionStatement(ctx) {
    const expression = this.visit(ctx.expression);
    const followedEmptyLine = this.visit(ctx.semiColon).followedEmptyLine;
    return {
      type: "EXPRESSION_STATEMENT",
      expression: expression,
      followedEmptyLine: followedEmptyLine
    };
  }

  identifierStatement(ctx) {
    const identifier = this.identifier(ctx.Identifier[0]);
    const statement = this.visit(ctx.statement);

    return {
      type: "IDENTIFIER_STATEMENT",
      identifier: identifier,
      statement: statement
    };
  }

  catchClause(ctx) {
    const modifiers = [];
    if (ctx.variableModifier) {
      ctx.variableModifier.map(modifier =>
        modifiers.push(this.visit(modifier))
      );
    }
    const catchType = this.visit(ctx.catchType);
    const id = this.identifier(ctx.Identifier[0]);
    const block = this.visit(ctx.block);

    return {
      type: "CATCH_CLAUSE",
      modifiers: modifiers,
      catchType: catchType,
      id: id,
      block: block
    };
  }

  catchType(ctx) {
    const types = [];
    if (ctx.qualifiedName) {
      ctx.qualifiedName.map(qualifiedName =>
        types.push(this.visit(qualifiedName))
      );
    }

    return {
      type: "CATCH_TYPE",
      list: types
    };
  }

  finallyBlock(ctx) {
    const block = this.visit(ctx.block);

    return {
      type: "FINALLY_BLOCK",
      block: block
    };
  }

  resourceSpecification(ctx) {
    const resources = this.visit(ctx.resources);

    return {
      type: "RESOURCE_SPECIFICATION",
      resources: resources
    };
  }

  resources(ctx) {
    const resources = [];
    if (ctx.resource) {
      ctx.resource.map(resource => resources.push(this.visit(resource)));
    }

    return {
      type: "RESOURCES",
      resources: resources
    };
  }

  resource(ctx) {
    const modifiers = [];
    if (ctx.variableModifier) {
      ctx.variableModifier.map(modifier =>
        modifiers.push(this.visit(modifier))
      );
    }
    const typeType = this.visit(ctx.classOrInterfaceType);
    const id = this.visit(ctx.variableDeclaratorId);
    const expression = this.visit(ctx.expression);

    return {
      type: "RESOURCE",
      modifiers: modifiers,
      typeType: typeType,
      id: id,
      expression: expression
    };
  }

  switchBlockStatementGroup(ctx) {
    const labels = [];
    if (ctx.switchLabel) {
      ctx.switchLabel.map(switchLabel => labels.push(this.visit(switchLabel)));
    }
    const statements = [];
    if (ctx.blockStatement) {
      ctx.blockStatement.map(blockStatement =>
        statements.push(this.visit(blockStatement))
      );
    }

    return {
      type: "SWITCH_BLOCK_STATEMENT_GROUP",
      labels: labels,
      statements: statements
    };
  }

  switchLabel(ctx) {
    if (ctx.switchLabelCase) {
      return this.visit(ctx.switchLabelCase);
    }
    if (ctx.switchLabelDefault) {
      return this.visit(ctx.switchLabelDefault);
    }
  }

  switchLabelCase(ctx) {
    const expression = this.visit(ctx.expression);

    return {
      type: "SWITCH_LABEL_CASE",
      expression: expression
    };
  }

  switchLabelDefault() {
    return {
      type: "SWITCH_LABEL_DEFAULT"
    };
  }

  forStatement(ctx) {
    const forControl = this.visit(ctx.forControl);
    const statement = this.visit(ctx.statement);

    return {
      type: "FOR_STATEMENT",
      forControl: forControl,
      body: statement
    };
  }

  forControl(ctx) {
    if (ctx.Colon) {
      const enhancedForStatement = {
        type: "ENHANCED_FOR_CONTROL",
        declaration: undefined,
        expression: undefined
      };

      const modifiers = [];
      if (ctx.variableModifier) {
        ctx.variableModifier.map(modifier =>
          modifiers.push(this.visit(modifier))
        );
      }

      const typeType = this.visit(ctx.expression[0]);

      const variableDeclaratorId = this.visit(ctx.variableDeclaratorId);
      const variableInitializer = this.visit(ctx.variableInitializer);
      const declarator = {
        type: "VARIABLE_DECLARATOR",
        id: variableDeclaratorId,
        init: variableInitializer
      };
      const declarators = {
        type: "VARIABLE_DECLARATORS",
        list: [declarator]
      };

      if (ctx.variableDeclarator) {
        ctx.variableDeclarator.map(declarator =>
          declarators.list.push(this.visit(declarator))
        );
      }

      enhancedForStatement.declaration = {
        type: "LOCAL_VARIABLE_DECLARATION",
        modifiers: modifiers,
        typeType: typeType,
        declarators: declarators
      };

      enhancedForStatement.expression = this.visit(ctx.expression[1]);

      return enhancedForStatement;
    }

    if (ctx.semiColon && ctx.semiColon.length == 2) {
      const basicForStatement = {
        type: "BASIC_FOR_CONTROL",
        forInit: undefined,
        expression: undefined,
        expressionList: undefined
      };

      // Find if last expression was the optional one
      if (
        ctx.expression &&
        ctx.expression[ctx.expression.length - 1].optionalExpression
      ) {
        basicForStatement.expression = this.visit(
          ctx.expression[ctx.expression.length - 1]
        );
      }

      basicForStatement.expressionList = this.visit(ctx.expressionList);

      if (ctx.variableDeclaratorId) {
        const modifiers = [];
        if (ctx.variableModifier) {
          ctx.variableModifier.map(modifier =>
            modifiers.push(this.visit(modifier))
          );
        }
        const typeType = this.visit(ctx.expression);

        const variableDeclaratorId = this.visit(ctx.variableDeclaratorId);
        const variableInitializer = this.visit(ctx.variableInitializer);
        const declarator = {
          type: "VARIABLE_DECLARATOR",
          id: variableDeclaratorId,
          init: variableInitializer
        };
        const declarators = {
          type: "VARIABLE_DECLARATORS",
          list: [declarator]
        };

        if (ctx.variableDeclarator) {
          ctx.variableDeclarator.map(declarator =>
            declarators.list.push(this.visit(declarator))
          );
        }

        basicForStatement.forInit = {
          type: "LOCAL_VARIABLE_DECLARATION",
          modifiers: modifiers,
          typeType: typeType,
          declarators: declarators
        };

        return basicForStatement;
      }

      if (ctx.expression) {
        const list = [];
        for (let i = 0; i < ctx.expression.length; i++) {
          if (!ctx.expression[i].optionalExpression) {
            list.push(this.visit(ctx.expression[i]));
          }
        }

        if (list.length > 0) {
          basicForStatement.forInit = {
            type: "EXPRESSION_LIST",
            list: list
          };
        }
      }

      return basicForStatement;
    }
  }

  enhancedForControl(ctx) {
    const modifiers = [];
    if (ctx.variableModifier) {
      ctx.variableModifier.map(modifier =>
        modifiers.push(this.visit(modifier))
      );
    }
    const typeType = this.visit(ctx.typeType);
    const id = this.visit(ctx.variableDeclaratorId);
    const iterator = this.visit(ctx.expression);

    return {
      type: "ENHANCED_FOR_CONTROL",
      modifiers: modifiers,
      typeType: typeType,
      id: id,
      iterator: iterator
    };
  }

  explicitGenericInvocationSuffix(ctx) {
    if (ctx.super) {
      return this.visit(ctx.super);
    }
    if (ctx.identifierArguments) {
      return this.visit(ctx.identifierArguments);
    }
  }

  identifierArguments(ctx) {
    const name = this.identifier(ctx.Identifier[0]);
    const args = this.visit(ctx.arguments);

    return {
      type: "IDENTIFIER_ARGUMENTS",
      name: name,
      arguments: args
    };
  }

  super(ctx) {
    const value = this.visit(ctx.superSuffix);

    return {
      type: "SUPER",
      arguments: value
    };
  }

  superSuffix(ctx) {
    if (ctx.arguments) {
      return this.visit(ctx.arguments);
    }
    if (ctx.dotIdentifierArguments) {
      return this.visit(ctx.dotIdentifierArguments);
    }
  }

  arguments(ctx) {
    if (ctx.expressionList) {
      return this.visit(ctx.expressionList);
    }
    return {
      type: "EXPRESSION_LIST",
      list: []
    };
  }

  dotIdentifierArguments(ctx) {
    const name = this.identifier(ctx.Identifier[0]);
    const args = this.visit(ctx.arguments);

    return {
      type: "DOT_IDENTIFIER_ARGUMENTS",
      name: name,
      arguments: args
    };
  }

  parExpression(ctx) {
    const expression = this.visit(ctx.expression);

    return {
      type: "PAR_EXPRESSION",
      expression: expression
    };
  }

  expressionList(ctx) {
    const list = [];
    if (ctx.expression) {
      ctx.expression.map(expression => list.push(this.visit(expression)));
    }

    return {
      type: "EXPRESSION_LIST",
      list: list
    };
  }

  methodInvocation(ctx) {
    const name = this.identifier(ctx.Identifier[0]);
    const expressionList = this.visit(ctx.expressionList);
    const dimensions = [];
    if (ctx.dimension) {
      ctx.dimension.map(dimension => dimensions.push(this.visit(dimension)));
    }

    return {
      type: "METHOD_INVOCATION",
      name: name,
      parameters: expressionList,
      dimensions: dimensions
    };
  }

  expression(ctx) {
    if (ctx.atomic) {
      const atomic = this.visit(ctx.atomic);

      if (ctx.squareExpressionRest) {
        const squareExpressionRest = this.visit(ctx.squareExpressionRest);

        return {
          type: "SQUARE_EXPRESSION",
          expression: atomic,
          squareExpression: squareExpressionRest.expression
        };
      }

      if (
        ctx.ifElseExpressionRest &&
        !ctx.operatorExpressionRest &&
        !ctx.qualifiedExpressionRest
      ) {
        const ifElseExpressionRest = this.visit(ctx.ifElseExpressionRest);

        return {
          type: "IF_ELSE_EXPRESSION",
          condition: atomic,
          if: ifElseExpressionRest.if,
          else: ifElseExpressionRest.else
        };
      }

      if (ctx.qualifiedExpressionRest) {
        const rest = this.visit(ctx.qualifiedExpressionRest);

        let expression = {
          type: "QUALIFIED_EXPRESSION",
          expression: atomic,
          rest: rest
        };

        if (ctx.instanceofExpressionRest) {
          const instanceofExpressionRest = this.visit(
            ctx.instanceofExpressionRest
          );

          expression = {
            type: "INSTANCEOF_EXPRESSION",
            expression: expression,
            instanceof: instanceofExpressionRest.typeType
          };

          if (instanceofExpressionRest.operatorExpressionRest) {
            expression = {
              type: "OPERATOR_EXPRESSION",
              left: expression,
              operator:
                instanceofExpressionRest.operatorExpressionRest.operator,
              right: instanceofExpressionRest.operatorExpressionRest.expression
            };
          }
        }

        if (ctx.postfixExpressionRest) {
          const postfixExpressionRest = this.visit(ctx.postfixExpressionRest);

          expression = {
            type: "POSTFIX_EXPRESSION",
            postfix: postfixExpressionRest.value,
            expression: expression
          };
        }

        if (ctx.operatorExpressionRest) {
          const operatorExpressionRest = this.visit(ctx.operatorExpressionRest);

          expression = {
            type: "OPERATOR_EXPRESSION",
            left: expression,
            operator: operatorExpressionRest.operator,
            right: operatorExpressionRest.expression
          };
        }

        if (ctx.ifElseExpressionRest) {
          const ifElseExpressionRest = this.visit(ctx.ifElseExpressionRest);

          return {
            type: "IF_ELSE_EXPRESSION",
            condition: expression,
            if: ifElseExpressionRest.if,
            else: ifElseExpressionRest.else
          };
        }

        return expression;
      }

      if (ctx.postfixExpressionRest) {
        const postfixExpressionRest = this.visit(ctx.postfixExpressionRest);

        return {
          type: "POSTFIX_EXPRESSION",
          postfix: postfixExpressionRest.value,
          expression: atomic
        };
      }

      if (ctx.instanceofExpressionRest) {
        const instanceofExpressionRest = this.visit(
          ctx.instanceofExpressionRest
        );

        const instanceOfExpression = {
          type: "INSTANCEOF_EXPRESSION",
          expression: atomic,
          instanceof: instanceofExpressionRest.typeType
        };

        if (instanceofExpressionRest.operatorExpressionRest) {
          return {
            type: "OPERATOR_EXPRESSION",
            left: instanceOfExpression,
            operator: instanceofExpressionRest.operatorExpressionRest.operator,
            right: instanceofExpressionRest.operatorExpressionRest.expression
          };
        }

        return instanceOfExpression;
      }

      if (ctx.operatorExpressionRest) {
        const operatorExpressionRest = this.visit(ctx.operatorExpressionRest);

        const operatorExpression = {
          type: "OPERATOR_EXPRESSION",
          left: atomic,
          operator: operatorExpressionRest.operator,
          right: operatorExpressionRest.expression
        };

        if (ctx.ifElseExpressionRest) {
          const ifElseExpressionRest = this.visit(ctx.ifElseExpressionRest);

          return {
            type: "IF_ELSE_EXPRESSION",
            condition: operatorExpression,
            if: ifElseExpressionRest.if,
            else: ifElseExpressionRest.else
          };
        }

        return operatorExpression;
      }

      if (ctx.Pointer) {
        if (atomic.type !== "IDENTIFIER") {
          throw new MismatchedTokenException(
            "Found lambda expression but left side is not an identifier",
            undefined
          );
        }

        const body = this.visit(ctx.lambdaBody);

        return {
          type: "LAMBDA_EXPRESSION",
          parameters: {
            type: "IDENTIFIERS",
            identifiers: {
              type: "IDENTIFIER_LIST",
              list: [atomic]
            }
          },
          body: body
        };
      }

      if (ctx.methodReferenceRest) {
        const rest = this.visit(ctx.methodReferenceRest);

        return {
          type: "METHOD_REFERENCE",
          reference: atomic,
          typeArguments: rest.typeArguments,
          name: rest.name
        };
      }

      return atomic;
    }

    if (ctx.prefixExpression) {
      return this.visit(ctx.prefixExpression);
    }

    if (ctx.parExpressionOrCastExpressionOrLambdaExpression) {
      return this.visit(ctx.parExpressionOrCastExpressionOrLambdaExpression);
    }
  }

  atomic(ctx) {
    if (ctx.methodInvocation) {
      return this.visit(ctx.methodInvocation);
    }

    if (ctx.primary) {
      return this.visit(ctx.primary);
    }

    if (ctx.creator) {
      return this.visit(ctx.creator);
    }
  }

  instanceofExpressionRest(ctx) {
    const typeType = this.visit(ctx.typeType);

    let operatorExpressionRest = undefined;
    if (ctx.operatorExpressionRest) {
      operatorExpressionRest = this.visit(ctx.operatorExpressionRest);
    }

    return {
      type: "INSTANCEOF_EXPRESSION_REST",
      typeType: typeType,
      operatorExpressionRest: operatorExpressionRest
    };
  }

  squareExpressionRest(ctx) {
    const expression = this.visit(ctx.expression);

    return {
      type: "SQUARE_EXPRESSION_REST",
      expression: expression
    };
  }

  postfixExpressionRest(ctx) {
    let value = undefined;

    if (ctx.PlusPlus) {
      value = "++";
    }

    if (ctx.MinusMinus) {
      value = "--";
    }

    return {
      type: "POSTFIX_EXPRESSION_REST",
      value: value
    };
  }

  ifElseExpressionRest(ctx) {
    const ifExpression = this.visit(ctx.expression[0]);
    const elseExpression = this.visit(ctx.expression[1]);

    return {
      type: "IF_ELSE_EXPRESSION_REST",
      if: ifExpression,
      else: elseExpression
    };
  }

  operator(ctx) {
    let operator = undefined;
    // ('*'|'/'|'%')
    if (ctx.Star) {
      operator = "*";
    }
    if (ctx.Dash) {
      operator = "/";
    }
    if (ctx.Percentage) {
      operator = "%";
    }
    // ('+'|'-')
    if (ctx.Plus) {
      operator = "+";
    }
    if (ctx.Minus) {
      operator = "-";
    }
    // ('<<' | '>>>' | '>>')
    if (ctx.LessLess) {
      operator = "<<";
    }
    if (ctx.Greater) {
      if (ctx.Greater.length === 2) {
        operator = ">>";
      }
      if (ctx.Greater.length === 3) {
        operator = ">>>";
      }
    }
    // ('<=' | '>=' | '>' | '<')
    if (ctx.LessEquals) {
      operator = "<=";
    }
    if (ctx.GreaterEquals) {
      operator = ">=";
    }
    if (ctx.Greater && ctx.Greater.length === 1) {
      operator = ">";
    }
    if (ctx.Less) {
      operator = "<";
    }
    // ('==' | '!=')
    if (ctx.EqualsEquals) {
      operator = "==";
    }
    if (ctx.ExclamationmarkEquals) {
      operator = "!=";
    }
    // '&'
    if (ctx.And) {
      operator = "&";
    }
    // '^'
    if (ctx.Caret) {
      operator = "^";
    }
    // '|'
    if (ctx.Or) {
      operator = "|";
    }
    // '&&'
    if (ctx.AndAnd) {
      operator = "&&";
    }
    // '||'
    if (ctx.OrOr) {
      operator = "||";
    }
    // ('=' | '+=' | '-=' | '*=' | '/=' | '&=' | '|=' | '^=' | '>>=' | '>>>=' | '<<=' | '%=')
    if (ctx.Equals) {
      operator = "=";
    }
    if (ctx.PlusEquals) {
      operator = "+=";
    }
    if (ctx.MinusEquals) {
      operator = "-=";
    }
    if (ctx.StarEquals) {
      operator = "*=";
    }
    if (ctx.DashEquals) {
      operator = "/=";
    }
    if (ctx.AndEquals) {
      operator = "&=";
    }
    if (ctx.OrEquals) {
      operator = "|=";
    }
    if (ctx.CaretEquals) {
      operator = "^=";
    }
    if (ctx.GreaterGreaterEquals) {
      operator = ">>=";
    }
    if (ctx.GreaterGreaterGreaterEquals) {
      operator = ">>>=";
    }
    if (ctx.LessLessEquals) {
      operator = "<<=";
    }
    if (ctx.PercentageEquals) {
      operator = "%=";
    }

    return {
      type: "OPERATOR",
      operator: operator
    };
  }

  operatorExpressionRest(ctx) {
    const operator = this.visit(ctx.operator);

    let right = undefined;
    if (ctx.expression) {
      right = this.visit(ctx.expression);
    } else if (ctx.elementValueArrayInitializer) {
      right = this.visit(ctx.elementValueArrayInitializer);
    }

    if (operator) {
      return {
        type: "OPERATOR_EXPRESSION_REST",
        operator: operator,
        expression: right
      };
    }
  }

  qualifiedExpressionRest(ctx) {
    let expression = undefined;

    if (ctx.Identifier) {
      expression = this.identifier(ctx.Identifier[0]);

      if (ctx.typeArgumentsOrOperatorExpressionRest) {
        const typeArgumentsOrOperatorExpressionRest = this.visit(
          ctx.typeArgumentsOrOperatorExpressionRest
        );

        if (
          typeArgumentsOrOperatorExpressionRest.type ===
          "OPERATOR_EXPRESSION_REST"
        ) {
          expression = {
            type: "OPERATOR_EXPRESSION",
            left: expression,
            operator: typeArgumentsOrOperatorExpressionRest.operator,
            right: typeArgumentsOrOperatorExpressionRest.expression
          };
        } else {
          expression = {
            type: "CLASS_OR_INTERFACE_TYPE_ELEMENT",
            name: expression,
            typeArguments: typeArgumentsOrOperatorExpressionRest
          };
        }
      }

      if (ctx.dimension) {
        const dimensions = [];
        if (ctx.dimension) {
          ctx.dimension.map(dimension =>
            dimensions.push(this.visit(dimension))
          );
        }
        if (expression.type === "IDENTIFIER") {
          expression = {
            type: "CLASS_OR_INTERFACE_TYPE_ELEMENT",
            name: expression,
            dimensions: dimensions
          };
        } else if (expression.type === "CLASS_OR_INTERFACE_TYPE_ELEMENT") {
          expression.dimensions = dimensions;
        }
      }
    }

    if (ctx.methodInvocation) {
      expression = this.visit(ctx.methodInvocation);
    }

    if (ctx.This) {
      expression = {
        type: "THIS"
      };
    }

    if (ctx.Super) {
      expression = {
        type: "SUPER"
      };
    }

    if (ctx.Class) {
      expression = {
        type: "CLASS"
      };
    }

    if (ctx.creatorOptionalNonWildcardInnerCreator) {
      expression = this.visit(ctx.creatorOptionalNonWildcardInnerCreator);
    }

    if (ctx.explicitGenericInvocation) {
      expression = this.visit(ctx.explicitGenericInvocation);
    }

    if (ctx.qualifiedExpressionRest) {
      const rest = this.visit(ctx.qualifiedExpressionRest);

      return {
        type: "QUALIFIED_EXPRESSION",
        expression: expression,
        rest: rest
      };
    }

    if (ctx.methodReferenceRest) {
      const rest = this.visit(ctx.methodReferenceRest);

      return {
        type: "METHOD_REFERENCE",
        reference: expression,
        typeArguments: rest.typeArguments,
        name: rest.name
      };
    }

    return expression;
  }

  parExpressionOrCastExpressionOrLambdaExpression(ctx) {
    if (ctx.Pointer) {
      const body = this.visit(ctx.lambdaBody);

      let parameters = undefined;
      if (ctx.variableDeclaratorId) {
        parameters = {
          type: "FORMAL_PARAMETERS",
          parameters: []
        };
      } else {
        parameters = {
          type: "IDENTIFIERS",
          identifiers: undefined
        };
      }
      if (ctx.expression) {
        if (ctx.variableDeclaratorId) {
          parameters.parameters = [];

          for (let i = 0; i < ctx.expression.length; i++) {
            const typeType = this.visit(ctx.expression[i]);

            const variableDeclaratorId = this.visit(
              ctx.variableDeclaratorId[i]
            );

            const modifiers = [];
            if (
              ctx.Final &&
              ctx.Final.find(final => final.cnt === i) !== undefined
            ) {
              modifiers.push({
                type: "MODIFIER",
                value: "final"
              });
            }

            parameters.parameters.push({
              type: "FORMAL_PARAMETER",
              modifiers: modifiers,
              typeType: typeType,
              id: variableDeclaratorId,
              dotDotDot: false
            });
          }
        } else {
          parameters.identifiers = {
            type: "IDENTIFIER_LIST",
            list: []
          };

          parameters.identifiers.list = [];
          if (ctx.expression) {
            ctx.expression.map(expression => {
              const identifier = this.visit(expression);
              if (identifier.type !== "IDENTIFIER") {
                throw new MismatchedTokenException(
                  "Found lambda expression but left side is not an identifier",
                  undefined
                );
              }

              parameters.identifiers.list.push(identifier);
            });
          }
        }
      }

      return {
        type: "LAMBDA_EXPRESSION",
        parameters: parameters,
        body: body
      };
    }

    if (ctx.Final) {
      throw new MismatchedTokenException(
        "Found cast expression or parenthis expression with final modifier",
        undefined
      );
    }

    if (ctx.expression.length >= 2) {
      const value = this.visit(ctx.expression[0]);
      const expression = this.visit(ctx.expression[1]);

      if (ctx.operator) {
        // we have a operator expression
        const operator = this.visit(ctx.operator);

        return {
          type: "OPERATOR_EXPRESSION",
          left: value,
          operator: operator,
          right: expression
        };
      }
      // We have a cast expression

      // if identifier is not an identifier throw error
      if (
        value.type !== "IDENTIFIER" &&
        value.type !== "CLASS_OR_INTERFACE_TYPE_ELEMENT" &&
        value.type !== "TYPE_TYPE" &&
        value.type !== "PRIMITIVE_TYPE" &&
        value.type !== "QUALIFIED_EXPRESSION"
      ) {
        throw new MismatchedTokenException(
          "Found cast expression but cast expression is not an Identifier",
          undefined
        );
      }

      return {
        type: "CAST_EXPRESSION",
        castType: value,
        expression: expression
      };
    }

    // parExpression

    // if parExpression
    // -> no
    //       - annotations
    //       - typeArguments
    //       - LSquare/RSquare
    // -> only one expression

    if (
      // ctx.annotation ||
      // ctx.typeArguments ||
      // ctx.LSquare ||
      ctx.expression.length !== 1
    ) {
      throw new MismatchedTokenException(
        "Found parenthesis expression with annotations, typeArguments or Squares",
        undefined
      );
    }

    const expression = this.visit(ctx.expression);

    const parExpression = {
      type: "PAR_EXPRESSION",
      expression: expression
    };

    if (ctx.qualifiedExpressionRest) {
      const rest = this.visit(ctx.qualifiedExpressionRest);

      const qualifiedExpression = {
        type: "QUALIFIED_EXPRESSION",
        expression: parExpression,
        rest: rest
      };

      if (ctx.operatorExpressionRest) {
        // we have a operator expression
        const operatorExpressionRest = this.visit(ctx.operatorExpressionRest);

        const operatorExpression = {
          type: "OPERATOR_EXPRESSION",
          left: qualifiedExpression,
          operator: operatorExpressionRest.operator,
          right: operatorExpressionRest.expression
        };

        let ifElseExpressionRest = undefined;
        if (ctx.ifElseExpressionRest) {
          ifElseExpressionRest = this.visit(ctx.ifElseExpressionRest);
        }

        if (operatorExpression && ifElseExpressionRest) {
          return {
            type: "IF_ELSE_EXPRESSION",
            condition: operatorExpression,
            if: ifElseExpressionRest.if,
            else: ifElseExpressionRest.else
          };
        }
        if (operatorExpression) {
          return operatorExpression;
        }
        if (ifElseExpressionRest) {
          return {
            type: "IF_ELSE_EXPRESSION",
            condition: qualifiedExpression,
            if: ifElseExpressionRest.if,
            else: ifElseExpressionRest.else
          };
        }
      }

      if (ctx.operator || ctx.ifElseExpressionRest) {
        let operatorExpression = undefined;
        if (ctx.operator) {
          // we have a operator expression
          const operator = this.visit(ctx.operator);

          operatorExpression = {
            type: "OPERATOR_EXPRESSION",
            left: qualifiedExpression,
            operator: operator,
            right: expression
          };
        }

        let ifElseExpressionRest = undefined;
        if (ctx.ifElseExpressionRest) {
          ifElseExpressionRest = this.visit(ctx.ifElseExpressionRest);
        }

        if (operatorExpression && ifElseExpressionRest) {
          return {
            type: "IF_ELSE_EXPRESSION",
            condition: operatorExpression,
            if: ifElseExpressionRest.if,
            else: ifElseExpressionRest.else
          };
        }
        if (operatorExpression) {
          return operatorExpression;
        }
        if (ifElseExpressionRest) {
          return {
            type: "IF_ELSE_EXPRESSION",
            condition: qualifiedExpression,
            if: ifElseExpressionRest.if,
            else: ifElseExpressionRest.else
          };
        }
      }

      return qualifiedExpression;
    }

    if (ctx.ifElseExpressionRest) {
      const ifElseExpressionRest = this.visit(ctx.ifElseExpressionRest);

      return {
        type: "IF_ELSE_EXPRESSION",
        condition: parExpression,
        if: ifElseExpressionRest.if,
        else: ifElseExpressionRest.else
      };
    }

    return parExpression;
  }

  creatorOptionalNonWildcardInnerCreator(ctx) {
    const typeArguments = this.visit(ctx.nonWildcardTypeArguments);
    const innerCreator = this.visit(ctx.innerCreator);

    return {
      type: "CREATOR_OPTIONAL_NON_WILDCARD_INNER_CREATOR",
      typeArguments: typeArguments,
      innerCreator: innerCreator
    };
  }

  prefixExpression(ctx) {
    let prefix = undefined;

    if (ctx.Plus) {
      prefix = "+";
    }

    if (ctx.Minus) {
      prefix = "-";
    }

    if (ctx.PlusPlus) {
      prefix = "++";
    }

    if (ctx.MinusMinus) {
      prefix = "--";
    }

    if (ctx.Tilde) {
      prefix = "~";
    }

    if (ctx.Exclamationmark) {
      prefix = "!";
    }

    const expression = this.visit(ctx.expression);

    return {
      type: "PREFIX_EXPRESSION",
      prefix: prefix,
      expression: expression
    };
  }

  methodReferenceRest(ctx) {
    let name = undefined;
    if (ctx.Identifier) {
      name = this.identifier(ctx.Identifier[0]);
    } else if (ctx.New) {
      name = {
        type: "NEW"
      };
    }

    const typeArguments = this.visit(ctx.typeArguments);

    return {
      type: "METHOD_REFERENCE_REST",
      typeArguments: typeArguments,
      name: name
    };
  }

  lambdaExpression(ctx) {
    const parameters = this.visit(ctx.lambdaParameters);
    const body = this.visit(ctx.lambdaBody);

    return {
      type: "LAMBDA_EXPRESSION",
      parameters: parameters,
      body: body
    };
  }

  lambdaParameters(ctx) {
    if (ctx.Identifier) {
      return this.identifier(ctx.Identifier[0]);
    }

    if (ctx.formalParameterList) {
      const parameters = this.visit(ctx.formalParameterList);

      return {
        type: "FORMAL_PARAMETERS",
        parameters: parameters ? parameters : []
      };
    }

    if (ctx.identifierList) {
      const identifiers = this.visit(ctx.identifierList);

      return {
        type: "IDENTIFIERS",
        identifiers: identifiers
      };
    }

    if (ctx.LBrace) {
      return {
        type: "FORMAL_PARAMETERS",
        parameters: []
      };
    }
  }

  lambdaBody(ctx) {
    if (ctx.block) {
      return this.visit(ctx.block);
    }

    if (ctx.expression) {
      return this.visit(ctx.expression);
    }
  }

  classType(ctx) {
    const annotations = [];
    if (ctx.annotation) {
      ctx.annotation.map(annotation =>
        annotations.push(this.visit(annotation))
      );
    }
    const classOrInterfaceType = this.visit(ctx.classOrInterfaceType);

    return {
      type: "CLASS_TYPE",
      annotations: annotations,
      classOrInterfaceType: classOrInterfaceType
    };
  }

  creator(ctx) {
    if (ctx.nonWildcardCreator) {
      return this.visit(ctx.nonWildcardCreator);
    }

    if (ctx.simpleCreator) {
      return this.visit(ctx.simpleCreator);
    }
  }

  nonWildcardCreator(ctx) {
    const typeArguments = this.visit(ctx.nonWildcardTypeArguments);
    const name = this.visit(ctx.createdName);
    const rest = this.visit(ctx.classCreatorRest);

    return {
      type: "NON_WILDCARD_CREATOR",
      typeArguments: typeArguments,
      name: name,
      rest: rest
    };
  }

  simpleCreator(ctx) {
    const name = this.visit(ctx.createdName);
    let rest = undefined;
    if (ctx.arrayCreatorRest) {
      rest = this.visit(ctx.arrayCreatorRest);
    }
    if (ctx.classCreatorRest) {
      rest = this.visit(ctx.classCreatorRest);
    }

    return {
      type: "SIMPLE_CREATOR",
      name: name,
      rest: rest
    };
  }

  createdName(ctx) {
    if (ctx.identifierName) {
      return this.visit(ctx.identifierName);
    }

    if (ctx.primitiveType) {
      return this.visit(ctx.primitiveType);
    }
  }

  identifierName(ctx) {
    const elements = [];
    if (ctx.identifierNameElement) {
      ctx.identifierNameElement.map(identifierNameElement =>
        elements.push(this.visit(identifierNameElement))
      );
    }

    return {
      type: "IDENTIFIER_NAME",
      elements: elements
    };
  }

  identifierNameElement(ctx) {
    const id = this.identifier(ctx.Identifier[0]);
    const typeArguments = this.visit(ctx.nonWildcardTypeArgumentsOrDiamond);

    return {
      type: "IDENTIFIER_NAME_ELEMENT",
      id: id,
      typeArguments: typeArguments
    };
  }

  innerCreator(ctx) {
    const id = this.identifier(ctx.Identifier[0]);
    const typeArguments = this.visit(ctx.nonWildcardTypeArgumentsOrDiamond);
    const rest = this.visit(ctx.classCreatorRest);

    return {
      type: "INNER_CREATOR",
      id: id,
      typeArguments: typeArguments,
      rest: rest
    };
  }

  arrayCreatorRest(ctx) {
    const dimensions = [];
    const expressions = [];
    if (ctx.expression) {
      ctx.expression.map(expression => {
        const dimension = {
          type: "DIMENSION",
          expression: this.visit(expression)
        };
        expressions.push(dimension);
        dimensions.push(dimension);
      });
    }
    for (let i = 0; i < ctx.LSquare.length - expressions.length; i++) {
      dimensions.push({
        type: "DIMENSION"
      });
    }
    const arrayInitializer = this.visit(ctx.arrayInitializer);

    return {
      type: "ARRAY_CREATOR_REST",
      dimensions: dimensions,
      arrayInitializer: arrayInitializer
    };
  }

  classCreatorRest(ctx) {
    const args = this.visit(ctx.arguments);
    const body = this.visit(ctx.classBody);

    return {
      type: "CLASS_CREATOR_REST",
      arguments: args,
      body: body
    };
  }

  explicitGenericInvocation(ctx) {
    const typeArguments = this.visit(ctx.nonWildcardTypeArguments);
    const invocation = this.visit(ctx.explicitGenericInvocationSuffix);

    return {
      type: "GENERIC_INVOCATION",
      typeArguments: typeArguments,
      invocation: invocation
    };
  }

  typeArgumentsOrDiamond(ctx) {
    if (ctx.emptyDiamond) {
      return {
        type: "TYPE_ARGUMENTS",
        value: undefined
      };
    }

    if (ctx.typeArguments) {
      return this.visit(ctx.typeArguments);
    }
  }

  nonWildcardTypeArgumentsOrDiamond(ctx) {
    if (ctx.emptyDiamond) {
      return {
        type: "TYPE_ARGUMENTS",
        value: undefined
      };
    }

    if (ctx.nonWildcardTypeArguments) {
      return this.visit(ctx.nonWildcardTypeArguments);
    }
  }

  emptyDiamond() {
    // do nothing
  }

  nonWildcardTypeArguments(ctx) {
    return {
      type: "TYPE_ARGUMENTS",
      value: this.visit(ctx.typeList)
    };
  }

  qualifiedName(ctx) {
    const name = [];
    if (ctx.Identifier) {
      ctx.Identifier.map(Identifier => name.push(this.identifier(Identifier)));
    }
    return {
      type: "QUALIFIED_NAME",
      name: name
    };
  }

  primary(ctx) {
    if (ctx.nonWildcardTypeArguments) {
      const typeArguments = this.visit(ctx.nonWildcardTypeArguments);
      let args = undefined;
      if (ctx.explicitGenericInvocationSuffix) {
        args = this.visit(ctx.explicitGenericInvocationSuffix);
      }
      if (ctx.arguments) {
        args = {
          type: "THIS",
          arguments: this.visit(ctx.arguments)
        };
      }

      return {
        type: "GENERIC_INVOCATION",
        typeArguments: typeArguments,
        invocation: args
      };
    }

    if (ctx.thisOrSuper) {
      return this.visit(ctx.thisOrSuper);
    }

    if (ctx.literal) {
      return this.visit(ctx.literal);
    }

    if (ctx.Void) {
      return {
        type: "VOID"
      };
    }

    const annotations = [];
    if (ctx.annotation) {
      ctx.annotation.map(annotation =>
        annotations.push(this.visit(annotation))
      );
    }
    const dimensions = [];
    if (ctx.dimension) {
      ctx.dimension.map(dimension => dimensions.push(this.visit(dimension)));
    }

    let value = undefined;
    if (ctx.primitiveType) {
      value = this.visit(ctx.primitiveType);
      // if empty typeType return child
      if (annotations.length === 0 && dimensions.length === 0) {
        return value;
      }
    } else if (ctx.Identifier && ctx.Identifier) {
      const name = this.identifier(ctx.Identifier[0]);
      const typeArguments = this.visit(ctx.typeArguments);

      if (!typeArguments) {
        value = name;
      } else {
        value = {
          type: "CLASS_OR_INTERFACE_TYPE_ELEMENT",
          name: name,
          typeArguments: typeArguments
        };
      }
    } else if (
      ctx.identifierOrIdentifierWithTypeArgumentsOrOperatorExpression &&
      ctx.identifierOrIdentifierWithTypeArgumentsOrOperatorExpression
    ) {
      value = this.visit(
        ctx.identifierOrIdentifierWithTypeArgumentsOrOperatorExpression
      );
    }

    if (!value) {
      return annotations[0];
    }

    if (annotations.length === 0 && dimensions.length === 0) {
      return value;
    }

    return {
      type: "TYPE_TYPE",
      modifiers: annotations,
      value: value,
      dimensions: dimensions
    };
  }

  identifierOrIdentifierWithTypeArgumentsOrOperatorExpression(ctx) {
    const name = this.identifier(ctx.Identifier[0]);

    if (ctx.typeArgumentsOrOperatorExpressionRest) {
      const typeArgumentsOrOperatorExpressionRest = this.visit(
        ctx.typeArgumentsOrOperatorExpressionRest
      );

      if (
        typeArgumentsOrOperatorExpressionRest.type ===
        "OPERATOR_EXPRESSION_REST"
      ) {
        return {
          type: "OPERATOR_EXPRESSION",
          left: name,
          operator: typeArgumentsOrOperatorExpressionRest.operator,
          right: typeArgumentsOrOperatorExpressionRest.expression
        };
      }

      return {
        type: "CLASS_OR_INTERFACE_TYPE_ELEMENT",
        name: name,
        typeArguments: typeArgumentsOrOperatorExpressionRest
      };
    }

    return name;
  }

  dimension(ctx) {
    if (ctx.expression) {
      const expression = this.visit(ctx.expression);

      return {
        type: "DIMENSION",
        expression: expression
      };
    }

    return {
      type: "DIMENSION"
    };
  }

  thisOrSuper(ctx) {
    if (ctx.This) {
      if (ctx.arguments) {
        return {
          type: "THIS",
          arguments: this.visit(ctx.arguments)
        };
      }
      return {
        type: "THIS"
      };
    }

    if (ctx.Super) {
      if (ctx.arguments) {
        return {
          type: "SUPER",
          arguments: this.visit(ctx.arguments)
        };
      }
      return {
        type: "SUPER"
      };
    }
  }

  literal(ctx) {
    if (ctx.integerLiteral) {
      return this.visit(ctx.integerLiteral);
    }

    if (ctx.floatLiteral) {
      return this.visit(ctx.floatLiteral);
    }

    if (ctx.CharLiteral) {
      return {
        type: "CHAR_LITERAL",
        value: ctx.CharLiteral[0].image
      };
    }

    if (ctx.stringLiteral) {
      return this.visit(ctx.stringLiteral);
    }

    if (ctx.booleanLiteral) {
      return this.visit(ctx.booleanLiteral);
    }

    if (ctx.Null) {
      return {
        type: "NULL"
      };
    }
  }

  stringLiteral(ctx) {
    const value = ctx.StringLiteral[0].image;

    return {
      type: "STRING_LITERAL",
      value: value
    };
  }

  booleanLiteral(ctx) {
    let value = undefined;
    if (ctx.True) {
      value = "true";
    }

    if (ctx.False) {
      value = "false";
    }

    return {
      type: "BOOLEAN_LITERAL",
      value: value
    };
  }

  integerLiteral(ctx) {
    if (ctx.DecimalLiteral) {
      const value = ctx.DecimalLiteral[0].image;

      return {
        type: "DECIMAL_LITERAL",
        value: value
      };
    }

    if (ctx.HexLiteral) {
      const value = ctx.HexLiteral[0].image;

      return {
        type: "HEX_LITERAL",
        value: value
      };
    }

    if (ctx.OctLiteral) {
      const value = ctx.OctLiteral[0].image;

      return {
        type: "OCT_LITERAL",
        value: value
      };
    }

    if (ctx.BinaryLiteral) {
      const value = ctx.BinaryLiteral[0].image;

      return {
        type: "BINARY_LITERAL",
        value: value
      };
    }
  }

  floatLiteral(ctx) {
    if (ctx.FloatLiteral) {
      const value = ctx.FloatLiteral[0].image;

      return {
        type: "FLOAT_LITERAL",
        value: value
      };
    }

    if (ctx.HexFloatLiteral) {
      const value = ctx.HexFloatLiteral[0].image;

      return {
        type: "HEX_FLOAT_LITERAL",
        value: value
      };
    }
  }

  hexFloatLiteral(ctx) {
    const value = ctx.HexFloatLiteral[0].image;

    return {
      type: "HEX_FLOAT_LITERAL",
      value: value
    };
  }

  primitiveType(ctx) {
    let value = "";
    if (ctx.Boolean) {
      value = "boolean";
    } else if (ctx.Char) {
      value = "char";
    } else if (ctx.Byte) {
      value = "byte";
    } else if (ctx.Short) {
      value = "short";
    } else if (ctx.Int) {
      value = "int";
    } else if (ctx.Long) {
      value = "long";
    } else if (ctx.Float) {
      value = "float";
    } else if (ctx.Double) {
      value = "double";
    }

    return {
      type: "PRIMITIVE_TYPE",
      value: value
    };
  }

  semiColon(ctx) {
    const followedEmptyLine = !!ctx.SemiColonWithFollowEmptyLine;
    return {
      type: "SEMI_COLON",
      followedEmptyLine: followedEmptyLine
    };
  }

  identifier(value) {
    return {
      type: "IDENTIFIER",
      value: value.image
    };
  }

  commentStandalone(ctx) {
    if (ctx.LineCommentStandalone) {
      return this.LineCommentStandalone(ctx.LineCommentStandalone[0]);
    }

    if (ctx.JavaDocCommentStandalone) {
      return this.JavaDocTraditionalCommentStandalone(
        ctx.JavaDocCommentStandalone[0]
      );
    }

    if (ctx.TraditionalCommentStandalone) {
      return this.JavaDocTraditionalCommentStandalone(
        ctx.TraditionalCommentStandalone[0]
      );
    }
  }

  visit(node) {
    let astResult = super.visit(node);

    astResult = this.addCommentsToAst(node, astResult);

    return astResult;
  }

  addCommentsToAst(node, astResult) {
    if (node) {
      if (node.constructor === Array) {
        node.map(n => this.addComment(n, astResult));
      } else {
        this.addComment(node, astResult);
      }
    }
    return astResult;
  }

  addComment(node, astResult) {
    const hasComment =
      node.children.LineComment ||
      node.children.TraditionalComment ||
      node.children.JavaDocComment;
    if (!astResult || !hasComment) {
      return;
    }

    if (!astResult.comment && hasComment) {
      astResult.comments = [];
    }

    if (node.children.LineComment) {
      node.children.LineComment.map(lineComment =>
        astResult.comments.unshift(this.getComment(lineComment))
      );
    }

    if (node.children.TraditionalComment) {
      node.children.TraditionalComment.map(traditionalComment =>
        astResult.comments.unshift(this.getComment(traditionalComment))
      );
    }

    if (node.children.JavaDocComment) {
      node.children.JavaDocComment.map(javaDocComment =>
        astResult.comments.unshift(this.getComment(javaDocComment))
      );
    }
  }

  getComment(comment) {
    return {
      ast_type: "comment",
      value: comment.image.startsWith("//")
        ? comment.image.replace(/[\n\r]*/g, "")
        : comment.image.replace(/\*\/[\n\r]*/g, "*/"),
      leading: !comment.trailing,
      trailing: !!comment.trailing
    };
  }
}

module.exports = SQLToAstVisitor;
