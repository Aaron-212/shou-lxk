import type { HandleServerError } from "@sveltejs/kit/hooks";

// Never serialize provider errors, SQL, bindings, quota details or stack traces.
export const handleError: HandleServerError = ({ kind }) => {
  console.error(JSON.stringify({ event: "request_failed", kind }));
  return { message: "加载失败，请稍后重试。" };
};
