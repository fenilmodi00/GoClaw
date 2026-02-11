export interface SDLTemplateParams {
    akashmlApiKey: string;
    safeBotToken: string;
    safeGatewayToken: string;
}

export const generateSDLTemplate = (params: SDLTemplateParams): string => {
    const { akashmlApiKey, safeBotToken, safeGatewayToken } = params;

    return `version: "2.0"

services:
  openclaw:
    image: ghcr.io/fenilmodi00/openclaw:latest
    expose:
      - port: 18789
        as: 80
        to:
          - global: true
      - port: 18790
        as: 8080
        to:
          - global: true
    env:
      - HOME=/home/node
      - TERM=xterm-256color
      - MODEL_ID=meta-llama/Llama-3.3-70B-Instruct
      - BASE_URL=https://api.akashml.com/v1
      - API_KEY=${akashmlApiKey}
      - API_PROTOCOL=openai-completions
      - CONTEXT_WINDOW=200000
      - MAX_TOKENS=8192
      - WORKSPACE=/home/node/.openclaw/workspace
      - OPENCLAW_GATEWAY_TOKEN=${safeGatewayToken}
      - OPENCLAW_GATEWAY_BIND=lan
      - OPENCLAW_GATEWAY_PORT=18789
      - OPENCLAW_BRIDGE_PORT=18790
      - TELEGRAM_BOT_TOKEN=${safeBotToken}
      - TELEGRAM_ENABLED=true
    params:
      storage:
        openclaw-data:
          mount: /home/node/.openclaw
          readOnly: false

profiles:
  compute:
    openclaw:
      resources:
        cpu:
          units: 1.5
        memory:
          size: 3Gi
        storage:
          - size: 2Gi
          - name: openclaw-data
            size: 10Gi
            attributes:
              persistent: true
              class: beta3
  
  placement:
    akash:
      pricing:
        openclaw:
          denom: ibc/170C677610AC31DF0904FFE09CD3B5C657492170E7E52372E48756B71E56F2F1
          amount: 1000

deployment:
  openclaw:
    akash:
      profile: openclaw
      count: 1
`;
};
