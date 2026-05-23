import { mountButton } from "remote/Button";

const root = document.getElementById("root");
if (root) {
  mountButton(root, "Federated button from remote");
}
