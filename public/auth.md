# Sellico auth.md

You are an AI agent interacting with **Sellico** (`https://sellico.ru`), a Russian B2B SaaS operating system for marketplace sellers on Wildberries, Ozon, and Yandex Market.

Sellico supports **Auth.md agentic registration** and **OAuth 2.0 (RFC 8414 / RFC 9728 / RFC 7523)** for scoped, read-only programmatic access to Sellico's public MCP server and public catalog APIs, while keeping private seller CRM workspaces strictly isolated behind human login.

## Audience & Security Boundary

- **Agent scopes (`anonymous` registration):** `mcp:tools:read`, `public:catalog:read`, `public:pricing:read`.
- **Allowed operations:** Calling read-only tools on `POST https://sellico.ru/mcp`, inspecting token state at `GET https://sellico.ru/agent/me`, and reading public pricing and Markdown documentation.
- **Strict isolation:** Agent tokens do **not** grant access to private seller stores, marketplace API keys, or `/crm/` workspaces. Store owners create and manage private CRM accounts directly at [https://sellico.ru/register](https://sellico.ru/register).

## Step 1 — Discover Metadata

1. **Protected Resource Metadata (RFC 9728):**
   ```http
   GET https://sellico.ru/.well-known/oauth-protected-resource
   ```
2. **Authorization Server Metadata (RFC 8414 / OpenID Discovery):**
   ```http
   GET https://sellico.ru/.well-known/oauth-authorization-server
   ```
   Public signing keys (`ES256`) are published at `https://sellico.ru/.well-known/jwks.json`.

## Step 2 — Register Anonymous Agent Identity

Request a signed `identity_assertion` without human form-filling:

```http
POST https://sellico.ru/agent/identity
Content-Type: application/json

{
  "type": "anonymous",
  "agent_name": "your-agent-identifier"
}
```

Response (`200 OK`):
- `identity_assertion` — ES256-signed JWT assertion (`iss: "https://sellico.ru"`).
- `claim_token` & `claim_uri` (`https://sellico.ru/agent/identity/claim`) — optional handoff link if a human user wishes to register a full seller workspace at `https://sellico.ru/register`.

## Step 3 — Exchange Assertion for an OAuth 2.0 Access Token

Exchange `identity_assertion` at the token endpoint using RFC 7523 JWT-bearer grant (or `grant_type=client_credentials` for ephemeral read-only tokens):

```http
POST https://sellico.ru/oauth2/token
Content-Type: application/x-www-form-urlencoded

grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=<identity_assertion>
```

Response (`200 OK`):
```json
{
  "access_token": "<es256-jwt>",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "mcp:tools:read public:catalog:read public:pricing:read"
}
```

## Step 4 — Call Protected & MCP Endpoints

Pass the token in the `Authorization` header (`bearer_methods_supported: ["header"]`):

```http
GET https://sellico.ru/agent/me
Authorization: Bearer <access_token>
```

```http
POST https://sellico.ru/mcp
Authorization: Bearer <access_token>
Content-Type: application/json

{"jsonrpc":"2.0","id":1,"method":"tools/list"}
```

*(Note: Unauthenticated read-only calls to `POST https://sellico.ru/mcp` are also permitted; if an `Authorization: Bearer` header is supplied, its signature, expiration, and revocation status are strictly verified.)*

## Step 5 — Revoke Credentials

When finished, revoke your `access_token` per RFC 7009:

```http
POST https://sellico.ru/oauth2/revoke
Content-Type: application/x-www-form-urlencoded

token=<access_token>
```
