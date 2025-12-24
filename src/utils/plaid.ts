import {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  type LinkTokenCreateRequest,
  type ItemPublicTokenExchangeRequest,
} from "plaid";
import dotenv from "dotenv";

dotenv.config();

const env = (process.env.PLAID_ENV || "sandbox") as
  | "sandbox"
  | "development"
  | "production";
const basePath =
  env === "production"
    ? PlaidEnvironments.production
    : PlaidEnvironments.sandbox;

const configuration = new Configuration({
  basePath,
  baseOptions: {
    headers: {
      PLAID_CLIENT_ID: process.env.PLAID_CLIENTID!,
      PLAID_SECRET: process.env.PLAID_SECRET!,
    },
  },
});

export const plaidClient = new PlaidApi(configuration);

export async function createLinkToken(userId: string) {
  const request: LinkTokenCreateRequest = {
    user: { client_user_id: userId },
    client_name: process.env.APP_NAME || "Your App",
    products: ["auth"], // Minimal cost - add 'transactions' if needed
    country_codes: ["US"],
    language: "en",
  };
  const response = await plaidClient.linkTokenCreate(request);
  return { link_token: response.data.link_token };
}

export async function exchangePublicToken(public_token: string) {
  const request: ItemPublicTokenExchangeRequest = { public_token };
  const response = await plaidClient.itemPublicTokenExchange(request);
  return {
    access_token: response.data.access_token,
    item_id: response.data.item_id,
  };
}
