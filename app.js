/*
  AROHANA frontend configuration.
  Replace BOTH values with your own Supabase project values.
  Use the Project URL and Publishable key (or legacy anon public key).
  NEVER use a service_role or secret key in this file.
*/
const SUPABASE_URL = "https://bnouatokdwxnqwgpqrto.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_Z2OAKyNRQuNbvSCGCUKkYA_Sn5fK_3t";

const form = document.getElementById("registrationForm");
const submitButton = document.getElementById("submitButton");
const statusMessage = document.getElementById("statusMessage");
const ticketPlaceholder = document.getElementById("ticketPlaceholder");
const ticketCard = document.getElementById("ticketCard");
const downloadButton = document.getElementById("downloadTicket");

let supabaseClient = null;
let currentTicket = null;

function setStatus(message, type = "") {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
}

function isConfigured() {
  return SUPABASE_URL.startsWith("https://") &&
    !SUPABASE_URL.includes("PASTE_") &&
    SUPABASE_PUBLISHABLE_KEY.length > 20 &&
    !SUPABASE_PUBLISHABLE_KEY.includes("PASTE_");
}

function createClient() {
  if (!window.supabase?.createClient) {
    throw new Error("Supabase library did not load. Check your internet connection and refresh.");
  }
  if (!isConfigured()) {
    throw new Error("Supabase is not configured. Add your Project URL and Publishable key in app.js.");
  }
  if (!supabaseClient) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  }
  return supabaseClient;
}

function makeTicketId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  // UUID v4 fallback for browsers without crypto.randomUUID().
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
    const random = Math.random() * 16 | 0;
    const value = character === "x" ? random : (random & 0x3 | 0x8);
    return value.toString(16);
  });
}

function showTicket(ticket) {
  currentTicket = ticket;
  document.getElementById("ticketName").textContent = ticket.full_name;
  document.getElementById("ticketRoll").textContent = ticket.roll_number;
  document.getElementById("ticketId").textContent = ticket.id.slice(0, 8).toUpperCase();

  const qrContainer = document.getElementById("qrcode");
  qrContainer.innerHTML = "";
  const qrPayload = JSON.stringify({
    event: "AROHANA",
    university: "Kishkindha University",
    ticket_id: ticket.id,
    name: ticket.full_name,
    roll_number: ticket.roll_number
  });

  new QRCode(qrContainer, {
    text: qrPayload,
    width: 134,
    height: 134,
    colorDark: "#171525",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });

  ticketPlaceholder.classList.add("hidden");
  ticketCard.classList.remove("hidden");
  ticketCard.scrollIntoView({ behavior: "smooth", block: "center" });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus("");

  const fullName = document.getElementById("fullName").value.trim().replace(/\s+/g, " ");
  const rollNumber = document.getElementById("rollNumber").value.trim().toUpperCase();

  if (fullName.length < 2) {
    setStatus("Enter your full name (at least 2 characters).", "error");
    return;
  }
  if (!/^[A-Z0-9]+$/.test(rollNumber) || !rollNumber.startsWith("KUB") || rollNumber.length < 6) {
    setStatus("Enter a valid roll number starting with KUB, for example KUB26CSE321.", "error");
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Registering…";

  try {
    const client = createClient();
    const ticketId = makeTicketId();

    // The database has a unique constraint on roll_number, preventing duplicate entries.
    const { error } = await client.from("arohana_registrations").insert({
      id: ticketId,
      full_name: fullName,
      roll_number: rollNumber
    });

    if (error) {
      if (error.code === "23505") {
        throw new Error("This roll number is already registered. Contact the event team if you need help.");
      }
      if (error.code === "42501" || error.message?.toLowerCase().includes("row-level security")) {
        throw new Error("Database permission blocked this registration. Recheck the SQL policies in Supabase.");
      }
      throw new Error(error.message || "Registration failed. Please try again.");
    }

    showTicket({ id: ticketId, full_name: fullName, roll_number: rollNumber });
    setStatus("Registration successful. Your QR ticket is ready.", "success");
    form.reset();
  } catch (error) {
    console.error("AROHANA registration error:", error);
    setStatus(error.message || "Something went wrong. Please try again.", "error");
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = 'Generate my ticket <span>↗</span>';
  }
});

downloadButton.addEventListener("click", () => {
  if (!currentTicket) return;
  const qrImage = document.querySelector("#qrcode img");
  const qrCanvas = document.querySelector("#qrcode canvas");
  const qrData = qrImage?.src || qrCanvas?.toDataURL("image/png");
  if (!qrData) {
    setStatus("QR code is not ready yet. Please wait a moment.", "error");
    return;
  }

  const ticket = currentTicket;
  const canvas = document.createElement("canvas");
  canvas.width = 1000;
  canvas.height = 1400;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#f4e8d8";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#171525";
  ctx.font = "bold 48px Arial";
  ctx.fillText("✦ AROHANA", 75, 105);
  ctx.font = "22px Arial";
  ctx.fillStyle = "#70583f";
  ctx.fillText("KISHKINDHA UNIVERSITY · 2026 ENTRY PASS", 75, 155);
  ctx.strokeStyle = "#a88a6b";
  ctx.beginPath(); ctx.moveTo(75, 195); ctx.lineTo(925, 195); ctx.stroke();
  ctx.font = "20px Arial"; ctx.fillText("OFFICIAL STUDENT TICKET", 75, 270);
  ctx.fillStyle = "#171525"; ctx.font = "bold 56px Georgia";
  ctx.fillText(ticket.full_name.slice(0, 24), 75, 365);
  ctx.font = "28px Arial"; ctx.fillStyle = "#70583f";
  ctx.fillText(ticket.roll_number, 75, 420);

  const qr = new Image();
  qr.onload = () => {
    ctx.fillStyle = "#ffffff"; ctx.fillRect(330, 500, 340, 340);
    ctx.drawImage(qr, 350, 520, 300, 300);
    ctx.textAlign = "center"; ctx.fillStyle = "#70583f"; ctx.font = "22px Arial";
    ctx.fillText("Present this QR code at the entry desk", 500, 900);
    ctx.textAlign = "left"; ctx.fillStyle = "#171525"; ctx.font = "bold 22px Arial";
    ctx.fillText("TICKET ID", 75, 1030);
    ctx.font = "24px Arial"; ctx.fillText(ticket.id, 75, 1075);
    ctx.font = "18px Arial"; ctx.fillStyle = "#70583f";
    ctx.fillText("Keep this ticket safe. Duplicate registrations are not allowed.", 75, 1170);
    ctx.fillText("AROHANA · KISHKINDHA UNIVERSITY", 75, 1290);
    const link = document.createElement("a");
    link.download = `AROHANA-${ticket.roll_number}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };
  qr.onerror = () => setStatus("Could not prepare the ticket image. Try again.", "error");
  qr.src = qrData;
});
