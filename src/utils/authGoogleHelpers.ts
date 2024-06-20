/* eslint-disable @typescript-eslint/no-explicit-any */
import dotenv from "dotenv";
dotenv.config();
import { google, Auth } from "googleapis";
import { BadRequest } from "../errors/httpErrors";
import User, { IUser } from "../db/models/user.model";

const baseUrl = process.env.BASE_URL;
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

class GoogleService {
  public SCOPES: string[] = [
    "email",
    "profile",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email",
    "openid",
  ];

  generateClient() {
    const redirectUrl = `${baseUrl}/auth/googleAuth`;
    const client = new google.auth.OAuth2(clientId, clientSecret, redirectUrl);
    return client;
  }

  async getAccessToken(
    code: string,
    client: Auth.OAuth2Client
  ): Promise<string> {
    const { tokens } = await client.getToken(code);
    return tokens.id_token as string;
  }

  async verify(token: string, client: Auth.OAuth2Client): Promise<any> {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: clientId,
    });
    const payload = ticket.getPayload();
    return payload;
  }

  async findUserByEmail(email: string): Promise<IUser | null> {
    const user = await User.findOne({ email });
    return user || null;
  }

  async userGoogleSignup(
    code: string,
    client: Auth.OAuth2Client,
    userCustomId: string,
    payload?: any
  ): Promise<IUser | null> {
    let tokenId: string;
    if (!payload) {
      tokenId = await this.getAccessToken(code, client);
      payload = await this.verify(tokenId, client);
    }

    const user = await this.findUserByEmail(payload.email);
    if (user) return user;
    console.log(payload);

    try {
      const createdUser = await User.create({
        firstname: payload.given_name || "DefaultFirstName",
        lastname: payload.family_name || "DefaultLastName",
        email: payload.email,
        authMethod: "Google",
        accountType: "User",
        userCustomId,
        isVerified: true,
        authType: {
          googleUuid: payload.sub,
        },
        profilePicture:
          payload.picture ||
          "https://res.cloudinary.com/duzrrmfci/image/upload/v1703842924/logo.jpg",
        address: payload.address || "",
        phoneNumber: payload.phone_number || "",
      });
      console.log(createdUser);

      return createdUser;
    } catch (error: any) {
      console.log(error);
      throw new BadRequest(error.message, "INVALID_REQUEST_PARAMETERS");
    }
  }
}

export default new GoogleService();
