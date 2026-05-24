// Browser stub for @emotion/server/create-instance.
// @leafygreen-ui/emotion imports this at module load to enable SSR critical-CSS
// extraction, which pulls in @emotion/server -> readable-stream -> Buffer.
// We never SSR in the browser, so return no-op shims.
module.exports = function createEmotionServer() {
  return {
    extractCritical(html) {
      return { html, css: "", ids: [] };
    },
    renderStylesToString(html) {
      return html;
    },
    renderStylesToNodeStream() {
      throw new Error("renderStylesToNodeStream is not available in the browser");
    },
  };
};
module.exports.default = module.exports;
