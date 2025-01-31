import jwt from "jsonwebtoken";
import "dotenv/config";
import fs from "fs/promises";

export default class JwtUtils {
  static async sign(payload) {
    return jwt.sign(payload, await this.#getPrivateKey(), {
      algorithm: "RS256",
      expiresIn: "3h",
      issuer: "authentication-serivice",
    });
  }

  static async veryfy(token) {
    return jwt.verify(token, await this.#getPublicKey(), {
      algorithms: "RS256",
    });
  }

  static async #getPrivateKey() {
    return await fs.readFile(`${process.cwd()}/private.key`, "utf-8");
  }
  static async #getPublicKey() {
    return await fs.readFile(`${process.cwd()}/public.key`, "utf-8");
  }
}
