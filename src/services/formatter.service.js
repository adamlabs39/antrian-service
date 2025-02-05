export class FormatterService {
  /**
   * Convert camelCase keys to snake_case (deeply)
   * @param {Object|Array} obj
   * @returns {Object|Array}
   */
  static toSnakeCase(obj) {
    if (Array.isArray(obj)) {
      return obj.map((item) => FormatterService.toSnakeCase(item));
    } else if (obj !== null && typeof obj === "object") {
      return Object.keys(obj).reduce((acc, key) => {
        const snakeKey = FormatterService.camelToSnake(key);
        acc[snakeKey] = FormatterService.toSnakeCase(obj[key]);
        return acc;
      }, {});
    }
    return obj;
  }

  /**
   * Convert snake_case keys to camelCase (deeply)
   * @param {Object|Array} obj
   * @returns {Object|Array}
   */
  static toCamelCase(obj) {
    if (Array.isArray(obj)) {
      return obj.map((item) => FormatterService.toCamelCase(item));
    } else if (obj !== null && typeof obj === "object") {
      return Object.keys(obj).reduce((acc, key) => {
        const camelKey = FormatterService.snakeToCamel(key);
        acc[camelKey] = FormatterService.toCamelCase(obj[key]);
        return acc;
      }, {});
    }
    return obj;
  }

  /**
   * Convert a single camelCase string to snake_case
   * @param {string} str
   * @returns {string}
   */
  static camelToSnake(str) {
    return str.replace(/([A-Z])/g, "_$1").toLowerCase();
  }

  /**
   * Convert a single snake_case string to camelCase
   * @param {string} str
   * @returns {string}
   */
  static snakeToCamel(str) {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  /**
   * Extend each object in an array with a single object
   * @param {Object} obj - The object to merge into each array item
   * @param {Array} arr - The array of objects to extend
   * @returns {Array} - A new array with merged objects
   */
  static extendObjects(obj, arr) {
    if (!Array.isArray(arr)) {
      throw new TypeError("Second parameter must be an array");
    }
    if (typeof obj !== "object" || obj === null) {
      throw new TypeError("First parameter must be an object");
    }

    return arr.map((item) => ({ ...obj, ...item }));
  }
}
