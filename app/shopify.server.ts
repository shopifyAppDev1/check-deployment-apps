import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  DeliveryMethod,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { restResources } from "@shopify/shopify-api/rest/admin/2024-07";
import prisma from "./db.server";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.July24,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  restResources,
  future: {
    unstable_newEmbeddedAuthStrategy: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),

  webhooks: {
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks/uninstall",
    },
    PRODUCTS_CREATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks/products/create",
    },
    PRODUCTS_DELETE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks/products/delete",
    },
    PRODUCTS_UPDATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks/products/update",
    },
    COLLECTIONS_CREATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks/collections/create",
    },
  },

  
  hooks: {
    afterAuth: async ({ session }) => {
      try {
        console.log("Starting webhook registration", session);
        const webhooksInfo = await shopify.registerWebhooks({ session });
        console.log(webhooksInfo, "Webhook registration result");
      } catch (error) {
        console.error("Webhook registration error:", error);
      }
    },
  },
});



export default shopify;
export const apiVersion = ApiVersion.July24;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
