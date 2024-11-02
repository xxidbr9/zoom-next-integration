import axios from "axios";
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

const zoomAPI = axios.create({ baseURL: "https://api.zoom.us/v2" })

type TokenResponseType = {
  aud: string
  uid: string
  ver: number
  auid: string
  nbf: number
  code: string
  iss: string
  gno: number
  exp: number
  type: number
  iat: number
  aid: string
}

// Function to get the token
async function requestNewToken() {
  const data = new URLSearchParams({
    grant_type: "account_credentials",
    account_id: process.env.ZOOM_ACCOUNT_ID as string,
  });

  const config = {
    method: "post",
    url: "https://zoom.us/oauth/token",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${Buffer.from(process.env.ZOOM_CLIENT_ID + ":" + process.env.ZOOM_CLIENT_SECRET).toString("base64")}`,
    },
    data,
  };

  try {
    const response = await axios.request(config);
    const result = response.data
    console.log({ result });
    return result; // Should contain `access_token` and `expires_in`
  } catch (error) {
    console.error("Failed to refresh token:", error);
    throw error;
  }
}

// Utility to check and refresh token
async function checkAndRefreshToken() {
  let tokenRecord = await prisma.zoom_access_token.findFirst();

  // If no token is found in the database, request a new one and store it
  if (!tokenRecord) {
    console.log("Token not found in database. Requesting a new token...");
    const newToken = await requestNewToken();

    const expiresAt = new Date(Date.now() + newToken.expires_in * 1000);
    const { uid } = jwt.decode(newToken.access_token) as TokenResponseType;

    // Store the new token in the database
    tokenRecord = await prisma.zoom_access_token.create({
      data: {
        id: uid as string,  // Use a unique identifier for the token
        access_token: newToken.access_token,
        expire_at: expiresAt,
      },
    });
  }

  // Decode the token to check expiration
  const { exp } = jwt.decode(tokenRecord.access_token) as TokenResponseType;
  const isExpired = exp * 1000 < Date.now();

  if (isExpired) {
    // Refresh the token
    const newToken = await requestNewToken();
    const expiresAt = new Date(Date.now() + newToken.expires_in * 1000);

    if (newToken) {
      await prisma.zoom_access_token.update({
        where: { id: tokenRecord.id },
        data: {
          access_token: newToken.access_token,
          expire_at: expiresAt,
        },
      });
    }
  }
}

zoomAPI.interceptors.request.use(async (config) => {
  await checkAndRefreshToken();

  // Fetch the latest token
  const tokenRecord = await prisma.zoom_access_token.findFirst();
  if (tokenRecord) {
    config.headers.Authorization = `Bearer ${tokenRecord.access_token}`;
  }

  return config;
});

export { zoomAPI }