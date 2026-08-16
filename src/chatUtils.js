export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function parseSSE(buffer) {
  const events = [];

  const chunks = buffer.split("\n\n");

  for (let i = 0; i < chunks.length - 1; i++) {
    const chunk = chunks[i];

    const dataLines = chunk
      .split("\n")
      .filter((line) => line.startsWith("data:"));

    if (!dataLines.length) {
      continue;
    }

    const data = dataLines
      .map((line) => line.replace(/^data:\s?/, ""))
      .join("\n");

    try {
      events.push(JSON.parse(data));
    } catch {
      // Ignore incomplete/non-JSON SSE chunks.
    }
  }

  return events;
}

export function getRemainingBuffer(buffer) {
  const chunks = buffer.split("\n\n");

  return chunks[chunks.length - 1];
}

export function httpError(status) {
  const error = new Error(`The AI server returned HTTP ${status}.`);

  error.status = status;

  return error;
}

export function getErrorDetails(error) {
  const status = error?.status;

  if (status != null) {
    if (status === 429) {
      return {
        title: "You're sending messages too quickly.",
        message: "Please wait a moment and try again.",
      };
    }

    if (status === 401) {
      return {
        title: "Something went wrong",
        message:
          "We couldn't complete that response. The AI service needs to be checked by the administrator.",
      };
    }

    if (status === 400) {
      return {
        title: "We couldn't process that request.",
        message: "Please rephrase your message and try again.",
      };
    }

    if (status === 404) {
      return {
        title: "Connection problem",
        message:
          "We couldn't connect to the AI server. It may be temporarily unavailable.",
      };
    }

    return {
      title: "Something went wrong",
      message: "We couldn't complete that response. Please try again.",
    };
  }

  if (error?.kind === "tool-output-error") {
    return {
      title: "Lead scoring failed",
      message: "We couldn't calculate the lead score.",
      detail: error.message,
    };
  }

  if (
    error?.kind === "network" ||
    error instanceof TypeError ||
    /network|fetch|load failed|failed to fetch/i.test(error?.message || "")
  ) {
    return {
      title: "Connection problem",
      message:
        "We couldn't connect to the AI server. Check your connection and try again.",
    };
  }

  return {
    title: "Something went wrong",
    message: "We couldn't complete that response. Please try again.",
  };
}