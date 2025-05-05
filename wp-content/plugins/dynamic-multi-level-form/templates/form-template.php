<?php
/**
 * Template Name: Dynamic Form Template
 * 
 * A clean template for embedding the dynamic form in iframes
 */

// Remove admin bar
add_filter('show_admin_bar', '__return_false');

// Get the form shortcode
$form_shortcode = do_shortcode('[dynamic_form]');
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dynamic Form</title>
    <?php wp_head(); ?>
    <style>
        /* Reset some WordPress styling */
        html, body {
            margin: 0;
            padding: 0;
            background: transparent;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
        }
        .form-container {
            padding: 0;
            max-width: 100%;
        }
        /* Hide unnecessary elements when in iframe */
        .in-iframe .hide-in-iframe {
            display: none !important;
        }
    </style>
    <script>
        // Add class to body if in iframe
        document.addEventListener('DOMContentLoaded', function() {
            if (window.self !== window.top) {
                document.body.classList.add('in-iframe');
            }
        });
    </script>
</head>
<body <?php body_class(); ?>>
    <div class="form-container">
        <?php echo $form_shortcode; ?>
    </div>
    <?php wp_footer(); ?>
</body>
</html>
