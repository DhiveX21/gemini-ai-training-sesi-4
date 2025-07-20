const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");

// Remove welcome message when first message is sent
let isFirstMessage = true;

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  // Remove welcome message on first interaction
  if (isFirstMessage) {
    const welcomeMessage = chatBox.querySelector(".welcome-message");
    if (welcomeMessage) {
      welcomeMessage.style.opacity = "0";
      welcomeMessage.style.transform = "translateY(-20px)";
      setTimeout(() => welcomeMessage.remove(), 300);
    }
    isFirstMessage = false;
  }

  appendMessage("user", userMessage);
  input.value = "";

  // Create typing indicator
  const loadingHTML = `
    <div class="typing-indicator">
      <span></span><span></span><span></span>
    </div>
  `;
  const botMessageElement = appendMessage("bot", loadingHTML, true);

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: userMessage }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || "An error occurred while fetching the response."
      );
    }

    const data = await response.json();
    // Update the placeholder with the actual response
    botMessageElement.innerHTML = "";
    botMessageElement.textContent = `🤖 ${data.response}`;
  } catch (error) {
    console.error("Error fetching chat response:", error);
    // Update the placeholder with an error message
    botMessageElement.innerHTML = "";
    botMessageElement.textContent = `❌ Error: ${error.message}`;
  }
});

function appendMessage(sender, content, isHTML = false) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);

  // Add animation
  msg.style.opacity = "0";
  msg.style.transform = "translateY(20px)";

  if (isHTML) {
    msg.innerHTML = content;
  } else {
    msg.textContent = content;
  }

  chatBox.appendChild(msg);

  // Trigger animation
  setTimeout(() => {
    msg.style.transition = "all 0.3s ease";
    msg.style.opacity = "1";
    msg.style.transform = "translateY(0)";
  }, 10);

  chatBox.scrollTop = chatBox.scrollHeight;
  return msg;
}

// Add some interactive features
document.addEventListener("DOMContentLoaded", function () {
  // Add click handler for new chat button
  const newChatBtn = document.querySelector(".new-chat-btn");
  if (newChatBtn) {
    newChatBtn.addEventListener("click", function () {
      // Clear chat and show welcome message again
      const messages = chatBox.querySelectorAll(".message");
      messages.forEach((msg) => {
        msg.style.opacity = "0";
        msg.style.transform = "translateY(-20px)";
        setTimeout(() => msg.remove(), 300);
      });

      setTimeout(() => {
        if (!chatBox.querySelector(".welcome-message")) {
          const welcomeMessage = document.createElement("div");
          welcomeMessage.className = "welcome-message";
          welcomeMessage.innerHTML = `
            <div class="welcome-icon">🌟</div>
            <h2>Welcome to Neural Chat</h2>
            <p>I'm your AI assistant, ready to help with any questions or tasks you have. Start a conversation below!</p>
          `;
          chatBox.appendChild(welcomeMessage);
          isFirstMessage = true;
        }
      }, 300);
    });
  }

  // Add enter key support with shift+enter for new lines
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form.dispatchEvent(new Event("submit"));
    }
  });
});
