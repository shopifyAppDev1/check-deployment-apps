import { json, type ActionFunctionArgs } from '@remix-run/node';
import { authenticate } from '~/shopify.server'



export const action = async ({ request }: ActionFunctionArgs) => {
  const {shop , session , topic, payload} = await authenticate.webhook(request);

  switch (topic) {
    case "COLLECTIONS_CREATE":
        if(session){
            console.log("Recive the Collection event", payload, shop);

            return json(payload);
        }
      break;

    default: return json("Please give valid data here ")
      break;
  }
};

