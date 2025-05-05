/**
 * Helper script to communicate iframe height to parent window
 */
;(() => {
  // Only run if we're in an iframe
  if (window.self !== window.top) {
    // Function to send height to parent
    function sendHeightToParent() {
      const height = document.body.scrollHeight
      window.parent.postMessage(
        {
          type: "formHeight",
          height: height,
        },
        "*",
      ) // '*' should be replaced with the parent domain in production
    }

    // Send height on load
    window.addEventListener("load", sendHeightToParent)

    // Send height on resize
    window.addEventListener("resize", sendHeightToParent)

    // Create a MutationObserver to watch for DOM changes
    const observer = new MutationObserver(sendHeightToParent)

    // Start observing the document body for changes
    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
    })

    // Send height periodically (as a fallback)
    setInterval(sendHeightToParent, 500)
  }
})()
