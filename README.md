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

Run the updated `supabase/all-commerce.sql` once so the `automatic_shipping_enabled` policy column exists, then enable **Automatic shipping** in Admin > Policies only after adding these server-side variables:

```env
SHIPPO_API_KEY=your-shippo-api-token
SHIPPO_FROM_NAME=Store Fulfillment
SHIPPO_FROM_STREET1=your-warehouse-street
SHIPPO_FROM_CITY=your-warehouse-city
SHIPPO_FROM_STATE=your-warehouse-state
SHIPPO_FROM_ZIP=your-warehouse-postal-code
SHIPPO_FROM_COUNTRY=IN
SHIPPO_FROM_PHONE=your-warehouse-phone
SHIPPO_FROM_EMAIL=shipping@example.com
```

Optional parcel defaults used to quote Shippo rates when products do not have package dimensions:

```env
SHIPPO_PARCEL_LENGTH_IN=10
SHIPPO_PARCEL_WIDTH_IN=10
SHIPPO_PARCEL_HEIGHT_IN=4
SHIPPO_PARCEL_WEIGHT_LB=1
SHIPPO_LABEL_FILE_TYPE=PDF_4x6
```
