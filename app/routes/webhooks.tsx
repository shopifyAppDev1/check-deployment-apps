import type { ActionFunctionArgs} from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server"; // Your Prisma database instance

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, session } = await authenticate.webhook(request);

  switch (topic) {
    case "APP_UNINSTALLED":
      await handleAppUninstalled(shop);
      break;
    case "PRODUCTS_CREATE":
      await handleProductCreated(session);
      break;
    case "PRODUCTS_DELETE":
      await handleProductDeleted(session);
      break;
    case "PRODUCTS_UPDATE":
      await handleProductUpdated(session);
      break;
    case "COLLECTIONS_CREATE":
      await handleCollectionCreated(session);
      break;
    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }

  return json({ success: true });
};

// Handler functions for each webhook
async function handleAppUninstalled(shop: string) {
  await db.session.deleteMany({ where: { shop } });
  console.log(`App uninstalled for shop: ${shop}`);
}

async function handleProductCreated(session: any) {
  console.log("Product created webhook received", session);
  // Add your logic to handle the event here
}

async function handleProductDeleted(session: any) {
  console.log("Product deleted webhook received", session);
  // Add your logic to handle the event here
}

async function handleProductUpdated(session: any) {
  console.log("Product updated webhook received", session);
  // Add your logic to handle the event here
}

async function handleCollectionCreated(session: any) {
  console.log("Collection created webhook received", session);
  // Add your logic to handle the event here
}
