import "./index.css";
import { intitCloseModalButton } from "./renderer/intitCloseModalButton";
intitCloseModalButton();

import { RendererCatalog } from "./catalog/RendererCatalog.js";
const catalog = new RendererCatalog();
console.log(catalog);
