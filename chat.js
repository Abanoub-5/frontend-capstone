const form = document.getElementById("chat-form");
const input = document.getElementById("chat-input");
const messagesContainer = document.getElementById("chat-messages");

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

  try {
    showInputStreaming(toolContainer);

    const response = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages,
      }),
    });

    if (!response.ok) {
      throw new Error("The AI server returned an error.");
    }

    await readUIMessageStream(response, toolContainer);
  } catch (error) {
    showToolError(toolContainer, error.message);
  }
});

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
}

function showToolError(container, error) {
  container.innerHTML = `
    <div class="tool-error">
      <div class="tool-error-icon">⚠️</div>

      <div>
        <strong>Lead scoring failed</strong>

        <p>
          We couldn't calculate the lead score.
        </p>

        <small>
          ${escapeHtml(error || "Unknown error")}
        </small>

        <button
          class="btn btn-secondary retry-button"
          onclick="location.reload()"
        >
          Try again
        </button>
      </div>
    </div>
  `;
}

async function readUIMessageStream(response, container) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, {
      stream: true,
    });

    const events = parseSSE(buffer);

    for (const event of events) {
      handleStreamPart(event, container);
    }

    buffer = getRemainingBuffer(buffer);
  }
}

function handleStreamPart(part, container) {
  if (!part || !part.type) {
    return;
  }

  console.log("Tool stream part:", part);

  /*
   * TOOL INPUT STREAMING
   */
if (
  part.type === "tool-input-start" ||
  part.type === "tool-input-delta"
) {
  showInputStreaming(container, part);
  return;
}
  /*
   * TOOL INPUT AVAILABLE
   */
  if (part.type === "tool-input-available") {
    showInputAvailable(container, part.input);
    return;
  }

  /*
   * TOOL OUTPUT AVAILABLE
   */
  if (part.type === "tool-output-available") {
    showToolOutput(container, part.output);
    return;
  }

  /*
   * TOOL OUTPUT ERROR
   */
  if (part.type === "tool-output-error") {
    
    showToolError(
      container,
      part.errorText || "The lead scoring tool failed."
    );
    return;
}

if (part.type === "error") {
  showToolError(
    container,
    part.errorText || "The AI tool encountered an error."
  );

  return;

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