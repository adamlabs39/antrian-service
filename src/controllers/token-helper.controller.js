import { generateJwt } from "../generate-token.js";
/**
 * This method only for deleoping to easly get token without login
 */
export default class TokenHelperController{
    static async getToken(req, res, next){
        try{
            const token = await generateJwt()
            res.status(200).json({token})
        }catch(error){
            next(error)
        }       


    }
}