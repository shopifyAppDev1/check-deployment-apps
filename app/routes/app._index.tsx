import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Button,
  Card,
  FormLayout,
  Layout,
  Page,
  TextField,
} from "@shopify/polaris";
import { useCallback, useState } from "react";
import { useFetcher } from "react-router-dom";
import prisma from "~/db.server";
import { authenticate } from "~/shopify.server";

interface LoaderData {
  shopeData: Array<{ id: string; title: string; buttonTitle: string }>;
}

interface FormState {
  title: string;
  buttonTitle: string;
}

export const action: ActionFunction = async ({ request }) => {
  // Authenticate the admin to get session and shop information
  const { session } = await authenticate.admin(request);
  let shop = session.shop;
  let accesstoken = session.accessToken;
  console.log(accesstoken);

  // Convert shop to a string if it's not already
  if (typeof shop !== "string") {
    shop = String(shop);
  }

  const formData = await request.formData();
  const _action = formData.get("_action");

  console.log("Action received:", _action);

  if (_action === "create") {
    const title = formData.get("title") as string;
    const buttonTitle = formData.get("buttonTitle") as string;

    if (!title || !buttonTitle) {
      return json({ error: "Missing required fields" }, { status: 400 });
    }

    try {
      // Save the data to the database using Prisma

      const dataInsert = await prisma.announcebarlist.create({
        data: {
          shop: shop as string,
          title: title as string,

          buttonTitle: buttonTitle as string,
        },
      });

      return json({ dataInsert, accesstoken });
    } catch (error) {
      console.error("Error saving to the database:", error);
      return json(
        { error: "Failed to save announcement bar" },
        { status: 500 },
      );
    }
  }

  return json({ error: "Invalid action" }, { status: 400 });
};

export default function Index() {
  const [formState, setFormState] = useState<FormState>({
    title: "",
    buttonTitle: "",
  });
  const fetcherData = useFetcher(); // Initialize fetcher for form submission

  // Handle input changes
  const handleInputChange = useCallback(
    (field: keyof FormState) => (value: string) => {
      setFormState((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    [],
  );

  // Handle form submission
  const handleCreate = useCallback(() => {
    const formData = new FormData();
    formData.append("_action", "create");
    formData.append("title", formState.title);
    formData.append("buttonTitle", formState.buttonTitle);

    console.log(
      "Form Data Submitted:",
      formData.get("title"),
      formData.get("buttonTitle"),
    );

    fetcherData.submit(formData, { method: "POST" }); // Submit data
  }, [formState.title, formState.buttonTitle, fetcherData]);

  return (
    <Page>
      <Layout.Section>
        <Card>
          <FormLayout>
            <TextField
              value={formState.title}
              onChange={handleInputChange("title")}
              label="Title"
              type="text"
              autoComplete="title"
              helpText="Please write text here"
            />
            <TextField
              value={formState.buttonTitle}
              onChange={handleInputChange("buttonTitle")}
              label="Button Title"
              type="text"
              autoComplete="button-title"
              helpText="Please write Button Title here"
            />
            <Button onClick={handleCreate}>Submit</Button>
          </FormLayout>
        </Card>
      </Layout.Section>
    </Page>
  );
}
