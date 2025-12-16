// https://github.com/NeonGamerBot-QK/slack-zeon/blob/main/src/modules/ampcode.ts

async function getHtmlText() {
  try {
    const res = await fetch("https://ampcode.com/workspaces/hackclub", {
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "max-age=0",
        priority: "u=0, i",
        "sec-ch-ua": '"Not.A/Brand";v="99", "Chromium";v="136"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Linux"',
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "user-agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
        cookie: process.env.AMP_COOKIE || "",
      },
    });

    return {
      status: res.status,
      text: await res.text(),
    };
  } catch (error) {
    console.error("Failed to fetch AMP balance:", error);
    return {
      status: 0,
      text: "",
    };
  }
}

function extractJson(html: string) {
  const match = html.match(/data: (\[[\s\S]*?\]),\s*form:/);
  if (!match) {
    return null;
  }

  const dataStr = match[1]
    .replace(/new Date\((\d+)\)/g, "$1")
    .replace(/\(function\(a\)\{[\s\S]*?\}\)\(\{\}\)/g, "{}");

  try {
    const data = eval("(" + dataStr + ")");
    return data;
  } catch {
    return null;
  }
}

export interface AmpCredits {
  current: number;
  total: number;
  used: number;
  raw: {
    available: number;
    used: number;
  };
}

export async function getAmpBalance(): Promise<AmpCredits | null> {
  const ampReq = await getHtmlText();
  if (ampReq.status !== 200) return null;

  const json = extractJson(ampReq.text);
  if (!json) return null;

  const credits = json[3]?.data?.credits;
  if (!credits) return null;

  const currentBalance = credits.available;
  const totalTokens = credits.used + credits.available;
  const usedTokens = credits.used;

  return {
    current: Math.floor(currentBalance / 100),
    total: Math.floor(totalTokens / 100),
    used: usedTokens,
    raw: {
      available: credits.available,
      used: credits.used,
    },
  };
}
