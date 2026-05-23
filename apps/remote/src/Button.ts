export function mountButton(target: HTMLElement, label = "Remote button"): void {
  const btn = document.createElement("button");
  btn.textContent = label;
  btn.addEventListener("click", () => {
    btn.textContent = `${label} (clicked)`;
  });
  target.appendChild(btn);
}
