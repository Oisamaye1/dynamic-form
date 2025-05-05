<?php
/**
 * Template loader for Dynamic Form
 */

class DynamicFormTemplateLoader {
    
    public function __construct() {
        add_filter('theme_page_templates', array($this, 'add_page_template'));
        add_filter('template_include', array($this, 'load_template'));
    }
    
    /**
     * Add page template to the templates list
     */
    public function add_page_template($templates) {
        $templates['form-template.php'] = 'Dynamic Form Template';
        return $templates;
    }
    
    /**
     * Load the template when needed
     */
    public function load_template($template) {
        global $post;
        
        if (is_page() && get_post_meta($post->ID, '_wp_page_template', true) === 'form-template.php') {
            $new_template = plugin_dir_path(dirname(__FILE__)) . 'templates/form-template.php';
            if (file_exists($new_template)) {
                return $new_template;
            }
        }
        
        return $template;
    }
}

// Initialize the template loader
$dynamic_form_template_loader = new DynamicFormTemplateLoader();
