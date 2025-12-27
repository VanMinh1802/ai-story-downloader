const getKey = (key: string) => {
  // Thử Deno.env trước nếu có (Deno phía server)
  // deno-lint-ignore no-explicit-any
  const deno = (globalThis as any).Deno;
  if (deno) {
    return deno.env.get(key) || "";
  }
  // Dự phòng sang process.env (tương thích Next.js/Node)
  return globalThis.process?.env?.[key] || "";
};

export const env = {
  GENATION_API_KEY: getKey("GENATION_API_KEY"),
};

// Log phiên bản che dấu của key để debug
console.log("Loaded API Key:", env.GENATION_API_KEY ? `${env.GENATION_API_KEY.substring(0, 5)}...` : "NONE");
