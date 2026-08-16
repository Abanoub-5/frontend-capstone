import {
  escapeHtml,
  parseSSE,
  getRemainingBuffer,
  getErrorDetails,
  httpError,
} from "./src/chatUtils.js";

const MAX_INPUT_LENGTH = 300;
const API_URL = "/api/chat";

let failedMessage = null;
let failedContainer = null;
let isRetrying = false;
let isSending = false;

const form = document.getElementById("chat-form");
const input = document.getElementById("chat-input");
const submitButton = form?.querySelector('button[type="submit"]');
const messagesContainer = document.getElementById("chat-messages");

let messages = [];

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (isSending) return;

  const userMessage = input.value.trim();

  if (!userMessage) {
    announceStatus("Please describe the lead you want to score.");
    input.focus();
    return;
  }

  if (userMessage.length > MAX_INPUT_LENGTH) {
    showTooLongError();
    return;
  }

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
  setSending(true);
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
  } finally {
    setSending(false);
  }
}

function setSending(sending) {
  isSending = sending;

  if (submitButton) {
    submitButton.disabled = sending;
    submitButton.setAttribute("aria-busy", String(sending));
  }

  if (input) {
    input.disabled = sending;
  }
}

function showTooLongError() {
  const container = createToolContainer();

  container.innerHTML = `
    <div class="chat-error" role="alert">
      <span class="chat-error-icon" aria-hidden="true">⚠️</span>
      <div class="chat-error-body">
        <strong>Message too long</strong>
        <p>
          Please keep your message under ${MAX_INPUT_LENGTH} characters.
        </p>
      </div>
    </div>
  `;

  announceStatus("Your message was too long. Please shorten it and try again.");
  scrollToBottom();
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
  const engagement = input.engagement != null ? escapeHtml(input.engagement) : "—";
  const companySize =
    input.companySize != null ? escapeHtml(String(input.companySize)) : "—";

  container.innerHTML = `
    <div class="tool-state tool-input">
      <div class="tool-icon">📋</div>

      <div class="tool-content">
        <strong>Lead information received</strong>

        <div class="lead-input-grid">
          <div>
            <span>Company Size</span>
            <strong>
              ${companySize} employees
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
              ${engagement}
            </strong>
          </div>
        </div>
      </div>
    </div>
  `;

  scrollToBottom();
}

function showToolOutput(container, output) {
  const categoryClass = String(output.category || "").toLowerCase();
  const engagement = escapeHtml(output.engagement ?? "—");
  const companySize = escapeHtml(String(output.companySize ?? "—"));

  const score = Number.isFinite(Number(output.score)) ? Number(output.score) : 0;
  const category = output.category ? escapeHtml(String(output.category)) : "N/A";

  container.innerHTML = `
    <div class="score-card">
      <div class="score-header">
        <div>
          <span class="score-label">LEAD SCORE</span>
          <h3>${category}</h3>
        </div>

        <div class="score-number">
          ${score}
          <small>/100</small>
        </div>
      </div>

      <div class="score-progress">
        <div
          class="score-progress-bar ${categoryClass}"
          style="width: ${score}%"
        ></div>
      </div>

      <div class="score-details">
        <div>
          <span>Company Size</span>
          <strong>${companySize} employees</strong>
        </div>

        <div>
          <span>Budget</span>
          <strong>
            $${Number(output.budget).toLocaleString()}
          </strong>
        </div>

        <div>
          <span>Engagement</span>
          <strong>${engagement}</strong>
        </div>
      </div>
    </div>
  `;

  announceStatus(`Lead scored as ${category} with a score of ${score} out of 100.`);
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
    case "text-start":
      container._text = "";
      return;

    case "text-delta":
      renderText(container, part.delta || "");
      return;

    case "text-end":
      finishText(container);
      return;

    case "tool-input-start":
    case "tool-input-delta":
      showInputStreaming(container, part);
      return;

    case "tool-input-available":
      showInputAvailable(container, part.input);
      return;

    case "tool-output-available":
      showToolOutput(container, part.output);
      return;

    case "tool-output-error": {
      const toolError = new Error(
        part.errorText || "The lead scoring tool failed.",
      );

      toolError.kind = "tool-output-error";

      throw toolError;
    }

    case "error": {
      const streamError = new Error(
        part.errorText || "The AI tool encountered an error.",
      );

      streamError.kind = "stream-error";

      throw streamError;
    }
  }
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
    input.value = button.dataset.prompt ?? button.textContent.trim();
    input.focus();
  });
});

const clearDataButton = document.getElementById("clear-data");

clearDataButton?.addEventListener("click", () => {
  localStorage.clear();
  window.location.reload();
});