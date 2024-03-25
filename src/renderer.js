import "./index.css";
import { intitCloseModalButton } from "./renderer/intitCloseModalButton";
intitCloseModalButton();

// CATALOG //
import { RendererCatalog } from "./catalog/RendererCatalog.js";
const catalog = new RendererCatalog();
console.log(catalog)