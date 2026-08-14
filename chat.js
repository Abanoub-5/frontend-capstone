let failedMessage = null;
let isRetrying = false;

const form = document.getElementById("chat-form");
const input = document.getElementById("chat-input");
const messagesContainer = document.getElementById("chat-messages");

const API_URL = "http://localhost:3000/api/chat";

let messages = [];

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const userMessage = input.value.trim();

  if (!userMessage) return;

  addUserMessage(userMessage);

  messages.push({
    role: "user",
    parts: [
      {
        type: "text",
        text: userMessage,
      },
    ],
  });

  input.value = "";

  const toolContainer = createToolContainer();

  updateEmptyStates();

  await sendChatRequest(userMessage, messages.length - 1, toolContainer, false);

  input.focus();
});

async function sendChatRequest(text, index, container, isRetry) {
  showLoading(container);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: messages.slice(0, index + 1),
      }),
    });

    if (!response.ok) {
      throw httpError(response.status);
    }

    await readUIMessageStream(response, container);

    clearFailedState();
    announceStatus("");
  } catch (error) {
    handleRequestFailure(container, error, text, index, isRetry);
  }
}

function addUserMessage(text) {
  const message = document.createElement("div");

  message.className = "chat-message user-message";

  message.innerHTML = `
    <strong>You</strong>
    <p>${escapeHtml(text)}</p>
  `;

  messagesContainer.appendChild(message);
}

function createToolContainer() {
  const container = document.createElement("div");

  container.className = "tool-container";

  messagesContainer.appendChild(container);

  return container;
}

function showLoading(container) {
  container.innerHTML = `
    <div class="loading-skeleton" role="status" aria-label="Loading response">
      <div></div>
      <div></div>
      <div></div>
    </div>
  `;

  announceStatus("Loading response");
  scrollToBottom();
}

function showInputStreaming(container, part) {
  let inputPreview = "";

  if (part?.inputTextDelta) {
    inputPreview = escapeHtml(part.inputTextDelta);
  }

  container.innerHTML = `
    <div class="tool-state tool-streaming">
      <div class="tool-icon">⚙️</div>

      <div class="tool-content">
        <strong>Building lead score input</strong>

        <p>
          The AI is preparing the information for
          <strong>scoreLead</strong>.
        </p>

        ${
          inputPreview
            ? `
              <div class="tool-stream-preview">
                ${inputPreview}
              </div>
            `
            : `
              <div class="streaming-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            `
        }
      </div>
    </div>
  `;

  scrollToBottom();
}

function showInputAvailable(container, input) {
  container.innerHTML = `
    <div class="tool-state tool-input">
      <div class="tool-icon">📋</div>

      <div class="tool-content">
        <strong>Lead information received</strong>

        <div class="lead-input-grid">
          <div>
            <span>Company Size</span>
            <strong>
              ${input.companySize ?? "—"} employees
            </strong>
          </div>

          <div>
            <span>Budget</span>
            <strong>
              ${
                input.budget != null
                  ? "$" + Number(input.budget).toLocaleString()
                  : "—"
              }
            </strong>
          </div>

          <div>
            <span>Engagement</span>
            <strong>
              ${input.engagement ?? "—"}
            </strong>
          </div>
        </div>
      </div>
    </div>
  `;

  scrollToBottom();
}

function showToolOutput(container, output) {
  const categoryClass = output.category.toLowerCase();

  container.innerHTML = `
    <div class="score-card">
      <div class="score-header">
        <div>
          <span class="score-label">LEAD SCORE</span>
          <h3>${escapeHtml(output.category)}</h3>
        </div>

        <div class="score-number">
          ${output.score}
          <small>/100</small>
        </div>
      </div>

      <div class="score-progress">
        <div
          class="score-progress-bar ${categoryClass}"
          style="width: ${output.score}%"
        ></div>
      </div>

      <div class="score-details">
        <div>
          <span>Company Size</span>
          <strong>${output.companySize} employees</strong>
        </div>

        <div>
          <span>Budget</span>
          <strong>
            $${Number(output.budget).toLocaleString()}
          </strong>
        </div>

        <div>
          <span>Engagement</span>
          <strong>${escapeHtml(output.engagement)}</strong>
        </div>
      </div>
    </div>
  `;

  scrollToBottom();
}

function renderText(container, delta) {
  container._text = (container._text || "") + delta;

  const existing = container.querySelector(".chat-text");

  if (existing) {
    existing.childNodes[0].textContent = container._text;
    return;
  }

  const skeleton = container.querySelector(".loading-skeleton");

  if (skeleton) {
    skeleton.remove();
  }

  container.insertAdjacentHTML(
    "beforeend",
    `
      <div class="chat-text">
        ${escapeHtml(container._text)}
        <span class="chat-text-cursor" aria-hidden="true"></span>
      </div>
    `,
  );

  scrollToBottom();
}

function finishText(container) {
  const cursor = container.querySelector(".chat-text-cursor");

  if (cursor) {
    cursor.remove();
  }

  scrollToBottom();
}

function handleRequestFailure(container, error, text, index, isRetry) {
  failedMessage = { text, index };
  failedContainer = container;

  isRetrying = false;

  renderError(container, getErrorDetails(error));

  announceStatus("The response failed. Use Retry to try again.");
}

function retryFailed() {
  if (isRetrying) return;
  if (!failedMessage || !failedContainer) return;

  isRetrying = true;

  announceStatus("Retrying the failed message");

  sendChatRequest(
    failedMessage.text,
    failedMessage.index,
    failedContainer,
    true,
  ).finally(() => {
    isRetrying = false;
  });
}

function clearFailedState() {
  failedMessage = null;
  failedContainer = null;
}

function renderError(container, details) {
  container.innerHTML = `
    <div class="chat-error" role="alert">
      <span class="chat-error-icon" aria-hidden="true">⚠️</span>

      <div class="chat-error-body">
        <strong>${escapeHtml(details.title)}</strong>

        <p>${escapeHtml(details.message)}</p>

        ${
          details.detail
            ? `<small>${escapeHtml(details.detail)}</small>`
            : ""
        }

        <button class="btn btn-secondary retry-button" type="button">
          Retry
        </button>
      </div>
    </div>
  `;

  const retryButton = container.querySelector(".retry-button");

  retryButton.addEventListener("click", retryFailed);

  scrollToBottom();
}

function getErrorDetails(error) {
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
          "We couldn't complete that response. Check your API key in Settings and try again.",
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
          "We couldn't connect to the server. It may be temporarily unavailable.",
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
        "We couldn't connect to the server. Check your connection and try again.",
    };
  }

  return {
    title: "Something went wrong",
    message: "We couldn't complete that response. Please try again.",
  };
}

function httpError(status) {
  const error = new Error(`The AI server returned HTTP ${status}.`);

  error.status = status;

  return error;
}

async function readUIMessageStream(response, container) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";

  while (true) {
    let chunk;

    try {
      chunk = await reader.read();
    } catch (error) {
      const networkError = new Error("The response stream was interrupted.");

      networkError.kind = "network";

      throw networkError;
    }

    if (chunk.done) {
      break;
    }

    buffer += decoder.decode(chunk.value, {
      stream: true,
    });

    const events = parseSSE(buffer);

    for (const event of events) {
      handleStreamPart(event, container);
    }

    buffer = getRemainingBuffer(buffer);
  }

  const skeleton = container.querySelector(".loading-skeleton");

  if (skeleton) {
    skeleton.remove();
  }
}

function handleStreamPart(part, container) {
  if (!part || !part.type) {
    return;
  }

  switch (part.type) {
    /*
     * PLAIN TEXT STREAMING
     */
    case "text-start":
      container._text = "";
      return;

    case "text-delta":
      renderText(container, part.delta || "");
      return;

    case "text-end":
      finishText(container);
      return;

    /*
     * TOOL INPUT STREAMING
     */
    case "tool-input-start":
    case "tool-input-delta":
      showInputStreaming(container, part);
      return;

    /*
     * TOOL INPUT AVAILABLE
     */
    case "tool-input-available":
      showInputAvailable(container, part.input);
      return;

    /*
     * TOOL OUTPUT AVAILABLE
     */
    case "tool-output-available":
      showToolOutput(container, part.output);
      return;

    /*
     * TOOL OUTPUT ERROR
     */
    case "tool-output-error": {
      const toolError = new Error(
        part.errorText || "The lead scoring tool failed.",
      );

      toolError.kind = "tool-output-error";

      throw toolError;
    }

    /*
     * STREAM ERROR (e.g. the AI fails after streaming has started)
     */
    case "error": {
      const streamError = new Error(
        part.errorText || "The AI tool encountered an error.",
      );

      streamError.kind = "stream-error";

      throw streamError;
    }
  }
}

function parseSSE(buffer) {
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

function getRemainingBuffer(buffer) {
  const chunks = buffer.split("\n\n");

  return chunks[chunks.length - 1];
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function updateEmptyStates() {
  const hasMessages =
    messagesContainer.querySelector(".user-message, .tool-container") !== null;

  const emptyState = document.querySelector(".empty-state");

  if (emptyState) {
    emptyState.classList.toggle("hidden", hasMessages);
  }

  const toolEmpty = messagesContainer.querySelector(".tool-empty");

  if (toolEmpty) {
    toolEmpty.classList.toggle("hidden", hasMessages);
  }
}

function announceStatus(text) {
  const status = document.getElementById("chat-status");

  if (status) {
    status.textContent = text;
  }
}

function scrollToBottom() {
  const nearBottom =
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight - 120;

  if (nearBottom) {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
    });
  }
}

document.querySelectorAll(".suggestion").forEach((button) => {
  button.addEventListener("click", () => {
    input.value = button.textContent.trim();
    input.focus();
  });
});