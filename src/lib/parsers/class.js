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
 *
 * Relationships:
 *   - extends: inheritance (hollow triangle)
 *   - implements: interface implementation (dashed line + hollow triangle)
 *   - uses: association/dependency (dashed arrow)
 *   - has: aggregation (hollow diamond)
 *   - owns: composition (filled diamond)
 */

export function parseClassDiagram(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);

  if (!lines[0] || !lines[0].toLowerCase().startsWith('class:')) {
    return { error: 'Diagram must start with "class:"' };
  }

  const classes = [];
  const relationships = [];
  let currentClass = null;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    // Match class declaration with relationship: ClassName extends/implements/uses/has/owns Target {
    const classMatch = line.match(/^(\w+)(?:\s+(extends|implements|uses|has|owns)\s+(\w+))?\s*\{$/);
    if (classMatch) {
      if (currentClass) {
        classes.push(currentClass);
      }
      currentClass = {
        name: classMatch[1],
        fields: [],
        methods: []
      };

      // Store relationship separately
      if (classMatch[2] && classMatch[3]) {
        relationships.push({
          from: classMatch[1],
          to: classMatch[3],
          type: classMatch[2]
        });
      }
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

  return { classes, relationships };
}
