import { FormatterService } from "../services/formatter.service.js"

/**
 * 
 * @param {string} message 
 * @param {Object} payload 
 * @param {Object} properties 
 * @returns 
 */
const generateSuccessMessage = (message,payload,properties)=>{
    return {
        message,
        properties:FormatterService.toSnakeCase(properties),
        payload:FormatterService.toSnakeCase(payload)

    }
}

export { generateSuccessMessage }