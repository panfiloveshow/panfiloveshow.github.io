import { MCP_PROTOCOL_VERSION, MCP_TOOLS } from './tools.mjs';

export const AGENT_SCOPES = ['mcp:tools:read', 'public:catalog:read', 'public:pricing:read'];

export function buildProtectedResourceMetadata(origin = 'https://sellico.ru') {
  const cleanOrigin = origin.replace(/\/+$/, '');
  return {
    resource: cleanOrigin,
    resource_name: 'Sellico Public & MCP API',
    resource_logo_uri: `${cleanOrigin}/logo.svg`,
    resource_documentation: `${cleanOrigin}/agents.md`,
    authorization_servers: [cleanOrigin],
    scopes_supported: AGENT_SCOPES,
    bearer_methods_supported: ['header'],
  };
}

export function buildAuthorizationServerMetadata(origin = 'https://sellico.ru') {
  const cleanOrigin = origin.replace(/\/+$/, '');
  return {
    issuer: cleanOrigin,
    authorization_endpoint: `${cleanOrigin}/oauth2/authorize`,
    token_endpoint: `${cleanOrigin}/oauth2/token`,
    jwks_uri: `${cleanOrigin}/.well-known/jwks.json`,
    revocation_endpoint: `${cleanOrigin}/oauth2/revoke`,
    registration_endpoint: `${cleanOrigin}/agent/identity`,
    scopes_supported: ['openid', ...AGENT_SCOPES],
    response_types_supported: ['code'],
    grant_types_supported: [
      'authorization_code',
      'client_credentials',
      'urn:ietf:params:oauth:grant-type:jwt-bearer',
      'urn:workos:agent-auth:grant-type:claim',
    ],
    token_endpoint_auth_methods_supported: ['none', 'client_secret_post'],
    code_challenge_methods_supported: ['S256'],
    subject_types_supported: ['public'],
    id_token_signing_alg_values_supported: ['ES256'],
    service_documentation: `${cleanOrigin}/auth.md`,
    agent_auth: {
      skill: `${cleanOrigin}/auth.md`,
      register_uri: `${cleanOrigin}/agent/identity`,
      identity_endpoint: `${cleanOrigin}/agent/identity`,
      claim_uri: `${cleanOrigin}/agent/identity/claim`,
      claim_endpoint: `${cleanOrigin}/agent/identity/claim`,
      revocation_uri: `${cleanOrigin}/oauth2/revoke`,
      events_endpoint: `${cleanOrigin}/agent/event/notify`,
      identity_types_supported: ['anonymous'],
      anonymous: {
        credential_types_supported: ['access_token', 'jwt'],
        claim_uri: `${cleanOrigin}/agent/identity/claim`,
      },
      events_supported: [
        'https://schemas.workos.com/events/agent/auth/identity/assertion/revoked',
        'https://schemas.workos.com/events/agent/auth/credential/revoked',
      ],
    },
  };
}

export function buildMcpServerCard(origin = 'https://sellico.ru') {
  const cleanOrigin = origin.replace(/\/+$/, '');
  return {
    $schema: 'https://static.modelcontextprotocol.io/schemas/mcp-server-card/v1.json',
    version: '1.0',
    protocolVersion: MCP_PROTOCOL_VERSION,
    serverInfo: {
      name: 'sellico-public-mcp',
      title: 'Sellico Public MCP Server',
      version: '1.0.0',
      description:
        'Публичный read-only MCP-сервер российской операционной системы Sellico (sellico.ru) для продавцов на Wildberries, Ozon и Яндекс Маркете: поиск и чтение канонических страниц, тарифы и расчёт маржи и юнит-экономики.',
      websiteUrl: `${cleanOrigin}/`,
    },
    transport: {
      type: 'streamable-http',
      endpoint: `${cleanOrigin}/mcp`,
    },
    endpoints: {
      streamableHttp: `${cleanOrigin}/mcp`,
    },
    authentication: {
      required: false,
      schemes: ['bearer'],
    },
    capabilities: {
      tools: {
        listChanged: false,
      },
    },
    tools: MCP_TOOLS.map(({ name, title, description, inputSchema, annotations }) => ({
      name,
      title,
      description,
      inputSchema,
      annotations,
    })),
    documentationUrl: `${cleanOrigin}/agents.md`,
  };
}

export function buildA2aAgentCard(origin = 'https://sellico.ru') {
  const cleanOrigin = origin.replace(/\/+$/, '');
  return {
    name: 'Sellico Public Agent',
    version: '1.0.0',
    protocolVersion: '0.3.0',
    description:
      'Публичный read-only A2A-агент российской операционной системы Sellico (sellico.ru) для продавцов на Wildberries, Ozon и Яндекс Маркете: поиск по каноническим страницам, тарифы, сравнения инструментов и расчёт юнит-экономики.',
    url: `${cleanOrigin}/a2a`,
    supportedInterfaces: [
      {
        url: `${cleanOrigin}/a2a`,
        protocolBinding: 'JSONRPC',
      },
    ],
    provider: {
      organization: 'Sellico (ИП Зубарев Д.В.)',
      url: `${cleanOrigin}/`,
    },
    documentationUrl: `${cleanOrigin}/agents.md`,
    capabilities: {
      streaming: false,
      pushNotifications: false,
      stateTransitionHistory: false,
    },
    defaultInputModes: ['text/plain', 'application/json'],
    defaultOutputModes: ['text/plain', 'application/json'],
    skills: [
      {
        id: 'search_pages',
        name: 'Поиск канонических страниц Sellico',
        description: 'Ищет продуктовые страницы, сравнения, статьи, глоссарий и калькуляторы маркетплейсов на sellico.ru.',
        tags: ['search', 'wildberries', 'ozon', 'yandex-market', 'sellico'],
        examples: ['юнит-экономика SKU', 'сравнение Sellico с Excel'],
      },
      {
        id: 'get_pricing',
        name: 'Тарифы и лимиты Sellico',
        description: 'Возвращает актуальные цены в рублях, лимиты подключений, SKU и пользователей, а также правила пробного периода.',
        tags: ['pricing', 'plans', 'trial'],
        examples: ['Сколько стоит Sellico?', 'Какие лимиты у тарифа Про?'],
      },
      {
        id: 'compare_tools',
        name: 'Сравнение инструментов продавца',
        description: 'Разъясняет разницу между Sellico, таблицами Excel, внешними парсерами ниш и личными кабинетами маркетплейсов.',
        tags: ['comparison', 'excel', 'analytics'],
        examples: ['Чем Sellico отличается от внешних парсеров ниш?'],
      },
      {
        id: 'calculate_unit_economics',
        name: 'Расчёт маржи и юнит-экономики',
        description: 'Помогает рассчитать прибыль, чистую маржинальность и логистику с учётом процента выкупа.',
        tags: ['calculator', 'margin', 'unit-economics'],
        examples: ['Как посчитать юнит-экономику товара для Wildberries?'],
      },
    ],
  };
}
