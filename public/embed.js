/* Hanubees embeddable agent.
   Usage: <script src="https://www.hanubees.com/embed.js" data-bee="YOUR_HANDLE"></script>
   (YOUR_HANDLE = the business's @handle / bee name or slug) */
(function () {
  var s = document.currentScript;
  var bee = s && s.getAttribute("data-bee");
  if (!bee) { console.warn("[Hanubees] add data-bee=\"yourhandle\" to the script tag"); return; }
  var ORIGIN = "https://www.hanubees.com";
  var YELLOW = "#ffbe00";
  var open = false;

  // Launcher bubble
  var btn = document.createElement("button");
  btn.setAttribute("aria-label", "Chat");
  btn.style.cssText = "position:fixed;bottom:20px;right:20px;width:60px;height:60px;border-radius:50%;border:none;background:" + YELLOW + ";box-shadow:0 6px 24px rgba(0,0,0,.28);cursor:pointer;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:0";
  var img = document.createElement("img");
  img.src = ORIGIN + "/bee.png"; img.alt = "Chat";
  img.style.cssText = "width:40px;height:40px;object-fit:contain;pointer-events:none";
  btn.appendChild(img);

  // Chat iframe
  var frame = document.createElement("iframe");
  frame.src = ORIGIN + "/embed/" + encodeURIComponent(bee);
  frame.title = "Hanubees agent";
  frame.style.cssText = "position:fixed;bottom:90px;right:20px;width:380px;height:560px;max-width:calc(100vw - 32px);max-height:calc(100vh - 120px);border:none;border-radius:18px;box-shadow:0 12px 40px rgba(0,0,0,.35);z-index:2147483000;background:#121212;display:none";

  function toggle() {
    open = !open;
    frame.style.display = open ? "block" : "none";
    img.src = ORIGIN + (open ? "/bee.png" : "/bee.png");
  }
  btn.addEventListener("click", toggle);

  function mount() {
    document.body.appendChild(frame);
    document.body.appendChild(btn);
  }
  if (document.body) mount();
  else window.addEventListener("DOMContentLoaded", mount);
})();
