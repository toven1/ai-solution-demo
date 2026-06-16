export type BillingMode = "mock" | "live";
export type PgProvider = "mock" | "toss" | "portone";

export type BillingRuntimeConfig = {
  mode: BillingMode;
  provider: PgProvider;
  isLiveReady: boolean;
  missingRequirements: string[];
  commercialNotice: string;
};

export function getBillingConfig(): BillingRuntimeConfig {
  const mode = process.env.BILLING_PROVIDER === "live" ? "live" : "mock";
  const provider = normalizeProvider(process.env.PG_PROVIDER);
  const missingRequirements: string[] = [];

  if (mode !== "live") missingRequirements.push("BILLING_PROVIDER=live");
  if (provider === "mock") missingRequirements.push("PG_PROVIDER=toss 또는 PG_PROVIDER=portone");

  if (provider === "toss") {
    if (!process.env.TOSS_CLIENT_KEY) missingRequirements.push("TOSS_CLIENT_KEY");
    if (!process.env.TOSS_SECRET_KEY) missingRequirements.push("TOSS_SECRET_KEY");
  }

  if (provider === "portone") {
    if (!process.env.PORTONE_STORE_ID) missingRequirements.push("PORTONE_STORE_ID");
    if (!process.env.PORTONE_CHANNEL_KEY) missingRequirements.push("PORTONE_CHANNEL_KEY");
  }

  return {
    mode,
    provider,
    isLiveReady: mode === "live" && provider !== "mock" && missingRequirements.length === 0,
    missingRequirements,
    commercialNotice:
      "실제 결제는 사업자등록, PG 심사, 약관/개인정보/환불 정책, 정산계좌 준비 후 PG 결제창 연동으로 활성화해야 합니다."
  };
}

function normalizeProvider(value: string | undefined): PgProvider {
  if (value === "toss" || value === "portone") return value;
  return "mock";
}
