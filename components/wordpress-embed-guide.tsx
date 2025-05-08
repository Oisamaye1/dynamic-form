export default function WordPressEmbedGuide() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://your-vercel-app-url.vercel.app"

  const shortcodeExample = `
[iframe src="${siteUrl}/embed" width="100%" height="800" scrolling="yes"]
  `.trim()

  const htmlExample = `
<iframe 
  src="${siteUrl}/embed" 
  width="100%" 
  height="800" 
  style="border: none; max-width: 100%;" 
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
  allowfullscreen>
</iframe>
  `.trim()

  const pluginExample = `
// Add this to your functions.php or in a custom plugin
function custom_iframe_shortcode($atts) {
  $atts = shortcode_atts(
    array(
      'src' => '',
      'width' => '100%',
      'height' => '800',
      'scrolling' => 'yes',
    ),
    $atts
  );
  
  return '<iframe src="' . esc_url($atts['src']) . '" width="' . esc_attr($atts['width']) . '" height="' . esc_attr($atts['height']) . '" scrolling="' . esc_attr($atts['scrolling']) . '" style="border:0;" allowfullscreen></iframe>';
}
add_shortcode('iframe', 'custom_iframe_shortcode');
  `.trim()

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Embedding Your Form in WordPress</h2>
        <p className="mb-4">
          You can embed this form in your WordPress website using an iframe. Here are several methods to do this:
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Method 1: Using an iframe Shortcode Plugin</h3>
        <p>
          Install a plugin like "Iframe" or "Advanced iFrame" from the WordPress plugin repository, then use the
          shortcode:
        </p>
        <div className="bg-gray-100 p-4 rounded-md overflow-x-auto">
          <pre className="text-sm">{shortcodeExample}</pre>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Method 2: Using HTML Block</h3>
        <p>If you're using the WordPress block editor, add an HTML block and paste this code:</p>
        <div className="bg-gray-100 p-4 rounded-md overflow-x-auto">
          <pre className="text-sm">{htmlExample}</pre>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Method 3: Create Your Own Shortcode</h3>
        <p>Add this code to your theme's functions.php file or in a custom plugin:</p>
        <div className="bg-gray-100 p-4 rounded-md overflow-x-auto">
          <pre className="text-sm">{pluginExample}</pre>
        </div>
        <p>Then use the shortcode as shown in Method 1.</p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Important Notes</h3>
        <ul className="list-disc pl-5 space-y-2 text-yellow-700">
          <li>Make sure your WordPress site is using HTTPS if your form is hosted on HTTPS.</li>
          <li>You may need to adjust the height parameter based on your form's length.</li>
          <li>Some WordPress security plugins might block iframes - you may need to whitelist your form's domain.</li>
          <li>
            The form URL should be: <code className="bg-yellow-100 px-1 py-0.5 rounded">{siteUrl}/embed</code>
          </li>
        </ul>
      </div>
    </div>
  )
}
