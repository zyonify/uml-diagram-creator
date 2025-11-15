/**
 * Parse class diagram syntax
 * Format:
 * class:
 *   ClassName {
 *     +publicField: type
 *     -privateField: type
 *     +publicMethod()
 *   }
 *   SubClass extends ParentClass {
 *     ...
 *   }
 */

export function parseClassDiagram(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);

  if (!lines[0] || !lines[0].toLowerCase().startsWith('class:')) {
    return { error: 'Diagram must start with "class:"' };
  }

  const classes = [];
  let currentClass = null;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    // Match class declaration: ClassName { or SubClass extends Parent {
    const classMatch = line.match(/^(\w+)(?:\s+extends\s+(\w+))?\s*\{$/);
    if (classMatch) {
      if (currentClass) {
        classes.push(currentClass);
      }
      currentClass = {
        name: classMatch[1],
        extends: classMatch[2] || null,
        fields: [],
        methods: []
      };
      continue;
    }

    // Match closing brace
    if (line === '}') {
      if (currentClass) {
        classes.push(currentClass);
        currentClass = null;
      }
      continue;
    }

    // Match field or method inside class
    if (currentClass) {
      // Field: +name: type or -name: type
      const fieldMatch = line.match(/^([+\-#])(\w+):\s*(\w+)$/);
      if (fieldMatch) {
        currentClass.fields.push({
          visibility: fieldMatch[1],
          name: fieldMatch[2],
          type: fieldMatch[3]
        });
        continue;
      }

      // Method: +methodName() or -methodName()
      const methodMatch = line.match(/^([+\-#])(\w+)\(\)$/);
      if (methodMatch) {
        currentClass.methods.push({
          visibility: methodMatch[1],
          name: methodMatch[2]
        });
      }
    }
  }

  // Add last class if exists
  if (currentClass) {
    classes.push(currentClass);
  }

  return { classes };
}
