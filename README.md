# E-commerce site
## Environment variables

Add these variables in Vercel (or your local `.env.local`) for the SPARROW chatbot, Supabase commerce features, and Umami analytics.

### Required for Supabase commerce and invites

```env
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_ANON_KEY=your-supabase-anon-key
```

`SUPABASE_SERVICE_ROLE_KEY` is used only on the server for editable content, orders, users, and Supabase invite emails. `SUPABASE_ANON_KEY` is used for customer auth flows.

### Required for SPARROW chatbot

```env
OPENROUTER_API_KEY=your-openrouter-api-key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

The chatbot API reads `OPENROUTER_API_KEY`. The configured model order is:

1. `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free`
2. `openrouter/owl-alpha`
3. `deepseek/deepseek-v4-flash:free`
4. `nousresearch/hermes-3-llama-3.1-405b:free`

### Required for Umami admin analytics

```env
UMAMI_API_KEY=your-umami-cloud-api-key
UMAMI_API_CLIENT_ENDPOINT=https://api.umami.is/v1
UMAMI_WEBSITE_ID=c20d65b2-a78a-44f3-9d1b-62abfcb63d56
```

`UMAMI_API_KEY` is the private Umami Cloud API key. Keep it server-only and do not prefix it with `NEXT_PUBLIC_`. The default website id is already the one installed in the tracking script, but you can override it with `UMAMI_WEBSITE_ID`.

### Optional Umami dashboard iframe

```env
NEXT_PUBLIC_UMAMI_SHARE_URL=https://cloud.umami.is/share/your-share-token/your-site
```

This is optional. If provided, Admin > Analytics embeds your shared Umami dashboard in addition to the API-powered graphs.

### Required for automatic Shippo shipping

Run the updated `supabase/all-commerce.sql` once so the Shippo policy columns exist, then add your Shippo server-side API key:

```env
SHIPPO_API_KEY=your-shippo-api-token
```

After that, configure the sender address, parcel defaults, and label format in **Admin > Policies > Shippo Settings**. If Shippo cannot return carrier rates for a typed checkout address, checkout falls back to the policy **Shipping amount per order** as a store-arranged delivery option so customers can still complete online payment while automatic shipping is enabled. You can use a `shippo_test_...` key for Shippo test mode; Shippo test labels are sample labels and are not valid for mailing.
