import "dotenv/config";
import { UnauthorizedException } from "../exceptions/unauthorized.exception.js";

const VALID_API_KEY = process.env.API_KEY;
/**
 * 
 * @param {Array} allowedUrls 
 * @returns 
 */
export function apiKeyMiddleware(allowedUrls) {
    return function(req, res, next) {
        try {
            if(allowedUrls){
                if(allowedUrls.includes(req.originalUrl)){
                    const apiKey = req.headers['x-api-key'];           
            
                    if (!apiKey) {
                        throw new UnauthorizedException(
                        //     {
                        //     message: "API key is required",
                        //     error: [
                        //         {
                        //             message: "Silahkan isi API key"
                        //         }
                        //     ]
                        // }
                    );
                    }
                    
                    if (apiKey !== VALID_API_KEY) {
                        throw new UnauthorizedException({
                            message: "API key not valid",
                            error: [
                                {
                                    message: "Silahkan gunakan API key yang valid"
                                }
                            ]
                        });
                    }
                    next()
                }else{                    
                    next();
                }
            }                       
            
        } catch (error) {
            next(error);
        }
    };
}
