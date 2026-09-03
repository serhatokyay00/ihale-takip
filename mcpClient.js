const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
const { StreamableHTTPClientTransport } = require("@modelcontextprotocol/sdk/client/streamableHttp.js");

const MCP_URL = process.env.IHALE_MCP_URL || "https://ihalemcp.fastmcp.app/mcp";

let clientPromise = null;

async function getClient() {
  if (clientPromise) return clientPromise;
  clientPromise = (async () => {
    const transport = new StreamableHTTPClientTransport(new URL(MCP_URL));
    const client = new Client({ name: "ihale-takip", version: "1.0.0" }, { capabilities: {} });
    await client.connect(transport);
    return client;
  })();
  return clientPromise;
}

async function callTool(name, args) {
  const client = await getClient();
  const result = await client.callTool({ name, arguments: args });
  // MCP tool sonuclari genelde content[0].text icinde JSON/metin doner
  const first = result.content && result.content[0];
  if (!first) return null;
  if (first.type === "text") {
    try {
      return JSON.parse(first.text);
    } catch {
      return first.text;
    }
  }
  return first;
}

// tenderTypes: [1,2,3,4] (1=Mal,2=Yapim,3=Hizmet,4=Danismanlik)
// provinces: plaka numaralari, orn 6=Ankara, 34=Istanbul
async function searchTenders({ searchText, tenderTypes, provinces, limit = 50 }) {
  return callTool("search_tenders", {
    search_text: searchText || undefined,
    tender_types: tenderTypes && tenderTypes.length ? tenderTypes : undefined,
    provinces: provinces && provinces.length ? provinces : undefined,
    limit,
  });
}

async function getRecentTenders({ days = 3, tenderTypes, limit = 100 }) {
  return callTool("get_recent_tenders", {
    days,
    tender_types: tenderTypes && tenderTypes.length ? tenderTypes : undefined,
    limit,
  });
}

module.exports = { searchTenders, getRecentTenders, callTool };
