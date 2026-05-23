import { mountButton } from "./Button";

const root = document.getElementById("root");
if (root) {
  mountButton(root, "Click me (standalone)");
}
